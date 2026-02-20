import Link from 'next/link'
import { headers } from 'next/headers'
import ListingCard, { type Listing } from '@/components/listings/ListingCard'

interface ListingsApiResponse {
  listings: Listing[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ListingsPageProps {
  searchParams?: {
    page?: string
  }
}

const PAGE_SIZE = 12

function getBaseUrl() {
  const headerStore = headers()
  const protocol = headerStore.get('x-forwarded-proto') || 'http'
  const host = headerStore.get('host')

  if (host) {
    return `${protocol}://${host}`
  }

  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

function buildPageHref(page: number) {
  const params = new URLSearchParams()
  params.set('page', String(page))

  return `/listings?${params.toString()}`
}

async function getListings(page: number): Promise<ListingsApiResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  })

  try {
    const response = await fetch(`${getBaseUrl()}/api/listings?${params.toString()}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return { listings: [], total: 0, page, limit: PAGE_SIZE, totalPages: 1 }
    }

    return response.json()
  } catch {
    return { listings: [], total: 0, page, limit: PAGE_SIZE, totalPages: 1 }
  }
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const parsedPage = Number(searchParams?.page || '1')
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1
  const offset = (page - 1) * PAGE_SIZE

  const { listings, total, totalPages } = await getListings(page)

  const hasPrevious = page > 1
  const hasNext = page < totalPages

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Listings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Showing {offset + 1}-{Math.min(offset + listings.length, total)} of {total} listings
        </p>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </section>

      {listings.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center text-gray-500">
          No listings found.
        </div>
      )}

      <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Listings pagination">
        {hasPrevious ? (
          <Link
            href={buildPageHref(page - 1)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Previous
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400">
            Previous
          </span>
        )}

        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>

        {hasNext ? (
          <Link
            href={buildPageHref(page + 1)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Next
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400">
            Next
          </span>
        )}
      </nav>
    </main>
  )
}
