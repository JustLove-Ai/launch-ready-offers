'use client'

import { Offer, Product } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { OfferPreview } from '@/components/offer-preview'

interface OfferPreviewPanelProps {
  offer: Offer & { products: Product[] }
}

export function OfferPreviewPanel({ offer }: OfferPreviewPanelProps) {
  return (
    <Card className="sticky top-6 p-6">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">Live Preview</h2>
      <OfferPreview offer={offer} />
    </Card>
  )
}
