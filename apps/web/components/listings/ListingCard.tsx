import Image from 'next/image'

export interface Listing {
  id: string
  title: string
  images: string[]
  priceXLM: number
  bedrooms: number
  bathrooms: number
  location: string
  landlordName: string
}

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const imageSrc = listing.images[0] || '/images/airbnb1.jpg'

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video bg-gray-100">
        <Image
          src={imageSrc}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <div className="space-y-3 p-4">
        <h2 className="text-lg font-semibold text-gray-900">{listing.title}</h2>
        <p className="text-xl font-bold text-primary">{listing.priceXLM} XLM</p>
        <p className="text-sm text-gray-600">
          {listing.bedrooms} bd • {listing.bathrooms} ba
        </p>
        <p className="text-sm text-gray-600">{listing.location}</p>
        <p className="text-sm text-gray-500">Hosted by {listing.landlordName}</p>
      </div>
    </article>
  )
}
