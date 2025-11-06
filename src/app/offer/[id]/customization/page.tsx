import { getOfferById } from '@/actions/offer-actions'
import { notFound } from 'next/navigation'
import { CustomizationView } from '@/components/customization-view'

export default async function CustomizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getOfferById(id)

  if (!result.success || !result.offer) {
    notFound()
  }

  return <CustomizationView offer={result.offer} />
}
