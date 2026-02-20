import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/server'
import type { Listing } from '@/components/listings/ListingCard'

interface ListingsResponse {
  listings: Listing[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function GET(request: NextRequest) {
  const supabase = getServerClient()
  const searchParams = request.nextUrl.searchParams

  const pageParam = Number(searchParams.get('page') || '1')
  const limitParam = Number(searchParams.get('limit') || '12')

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : 12
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch listings', details: error.message },
      { status: 500 }
    )
  }

  const listings: Listing[] = (data || []).map((row: any) => {
    const images = Array.isArray(row.images)
      ? row.images
      : Array.isArray(row.image_urls)
        ? row.image_urls
        : row.image_url
          ? [row.image_url]
          : []

    return {
      id: String(row.id),
      title: row.title || 'Untitled Listing',
      images,
      priceXLM: Number(row.priceXLM ?? row.price_xlm ?? row.rent_xlm ?? 0),
      bedrooms: Number(row.bedrooms ?? 0),
      bathrooms: Number(row.bathrooms ?? 0),
      location: row.location || row.address || 'Location unavailable',
      landlordName:
        row.landlordName || row.landlord_name || row.owner_name || 'Unknown landlord',
    }
  })

  const total = count || 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const payload: ListingsResponse = {
    listings,
    total,
    page,
    limit,
    totalPages,
  }

  return NextResponse.json(payload)
}
