import { getOfferById } from '@/actions/offer-actions'
import { notFound } from 'next/navigation'
import { ProductsView } from '@/components/products-view'

export default async function ProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getOfferById(id)

  if (!result.success || !result.offer) {
    notFound()
  }

  return <ProductsView offer={result.offer} />
}
