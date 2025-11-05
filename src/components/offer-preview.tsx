'use client'

import { Offer, Product } from '@prisma/client'
import { Check } from 'lucide-react'

type OfferWithProducts = Offer & {
  products: Product[]
}

interface OfferPreviewProps {
  offer: OfferWithProducts
}

export function OfferPreview({ offer }: OfferPreviewProps) {
  const multiplier = offer.price > 0 ? (offer.totalValue / offer.price).toFixed(1) : '0.0'
  const regularProducts = offer.products.filter((p) => !p.isBonus)
  const bonuses = offer.products.filter((p) => p.isBonus)

  return (
    <div className="mx-auto max-w-2xl">
      {/* Stack Slide */}
      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-10 text-center">
          <h2 className="text-3xl font-bold text-white">
            Let Me Show You EVERYTHING You Get When You Order Today!
          </h2>
        </div>

        {/* Products List */}
        <div className="space-y-4 px-8 py-8">
          {regularProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                <span className="text-lg text-slate-900">{product.name}</span>
              </div>
              <span className="whitespace-nowrap text-xl font-semibold text-red-600">
                (${product.value.toFixed(2)} Value)
              </span>
            </div>
          ))}

          {bonuses.map((bonus) => (
            <div key={bonus.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                <div className="flex items-center gap-2">
                  <span className="text-lg text-slate-900">{bonus.name}</span>
                  <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                    BONUS!
                  </span>
                </div>
              </div>
              <span className="whitespace-nowrap text-xl font-semibold text-red-600">
                (${bonus.value.toFixed(2)} Value)
              </span>
            </div>
          ))}
        </div>

        {/* Total Value */}
        <div className="border-t-2 border-slate-200 bg-slate-50 px-8 py-6 text-center">
          <p className="mb-2 text-xl font-semibold text-slate-700">Total Value:</p>
          <p className="text-5xl font-bold text-red-600">${offer.totalValue.toFixed(2)}</p>
        </div>

        {/* Price */}
        <div className="bg-white px-8 py-6 text-center">
          <p className="mb-2 text-xl font-semibold text-slate-700">Get Your Copy Today For</p>
          <p className="text-6xl font-bold text-emerald-600">${offer.price.toFixed(2)}!</p>
        </div>

        {/* CTA */}
        <div className="bg-white px-8 pb-8">
          <button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-6 text-2xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
            YES! RESERVE MY COPY NOW!
          </button>
        </div>
      </div>

      {offer.products.length === 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">Add products to see your offer preview</p>
        </div>
      )}
    </div>
  )
}
