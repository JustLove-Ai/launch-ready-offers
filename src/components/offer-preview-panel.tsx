'use client'

import { Offer, Product } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { OfferPreview } from '@/components/offer-preview'

interface OfferPreviewPanelProps {
  offer: Offer & { products: Product[] }
}

export function OfferPreviewPanel({ offer }: OfferPreviewPanelProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="p-6 pb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-slate-900">Live Preview</h2>
      </div>
      <div className="flex-1 overflow-auto px-6 pb-6">
        <OfferPreview offer={offer} />
      </div>
    </Card>
  )
}
