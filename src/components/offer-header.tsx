'use client'

import { Offer, Product, Task } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { CalendarClock, DollarSign } from 'lucide-react'

type OfferWithProducts = Offer & {
  products: (Product & {
    tasks: Task[]
  })[]
}

interface OfferHeaderProps {
  offer: OfferWithProducts
}

export function OfferHeader({ offer }: OfferHeaderProps) {
  const multiplier = offer.price > 0 ? (offer.totalValue / offer.price).toFixed(1) : '0.0'

  return (
    <div className="flex items-center gap-4">
      {/* Launch Date */}
      {offer.launchDate && (
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
          <CalendarClock className="h-4 w-4 text-slate-600" />
          <div className="text-sm">
            <p className="font-medium text-slate-900">
              {formatDistanceToNow(new Date(offer.launchDate), { addSuffix: true })}
            </p>
          </div>
        </div>
      )}

      {/* Value & Price */}
      <div className="flex items-center gap-4 rounded-lg bg-slate-100 px-4 py-2">
        <div className="text-center">
          <p className="text-xs text-slate-500">Products</p>
          <p className="text-lg font-semibold text-slate-900">{offer.products.length}</p>
        </div>
        <div className="h-8 w-px bg-slate-300" />
        <div className="text-center">
          <p className="text-xs text-slate-500">Total Value</p>
          <p className="text-lg font-semibold text-purple-600">${offer.totalValue.toFixed(0)}</p>
        </div>
        <div className="h-8 w-px bg-slate-300" />
        <div className="text-center">
          <p className="text-xs text-slate-500">Your Price</p>
          <p className="text-lg font-semibold text-emerald-600">${offer.price.toFixed(0)}</p>
        </div>
        {multiplier !== '0.0' && (
          <>
            <div className="h-8 w-px bg-slate-300" />
            <div className="text-center">
              <p className="text-xs text-slate-500">Multiplier</p>
              <p className="text-lg font-semibold text-pink-600">{multiplier}x</p>
            </div>
          </>
        )}
      </div>

      {/* Status Badge */}
      <Badge
        variant={
          offer.status === 'LAUNCHED'
            ? 'default'
            : offer.status === 'READY'
              ? 'secondary'
              : 'outline'
        }
        className="px-3 py-1 text-sm"
      >
        {offer.status}
      </Badge>
    </div>
  )
}
