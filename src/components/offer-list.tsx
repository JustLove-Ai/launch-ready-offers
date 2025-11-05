'use client'

import { Offer, Product, Task } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { CalendarClock, Package, CheckCircle2, Clock } from 'lucide-react'

type OfferWithProducts = Offer & {
  products: (Product & {
    tasks: Task[]
  })[]
}

interface OfferListProps {
  offers: OfferWithProducts[]
}

export function OfferList({ offers }: OfferListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {offers.map((offer) => {
        const totalTasks = offer.products.reduce((sum, p) => sum + p.tasks.length, 0)
        const completedTasks = offer.products.reduce(
          (sum, p) => sum + p.tasks.filter((t) => t.status === 'COMPLETED').length,
          0
        )
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        const multiplier = offer.price > 0 ? (offer.totalValue / offer.price).toFixed(1) : '0'

        return (
          <Link key={offer.id} href={`/offer/${offer.id}`}>
            <Card className="group h-full cursor-pointer border-slate-200 bg-white transition-all hover:scale-[1.02] hover:shadow-xl">
              <CardHeader>
                <div className="mb-2 flex items-start justify-between">
                  <Badge
                    variant={
                      offer.status === 'LAUNCHED'
                        ? 'default'
                        : offer.status === 'READY'
                          ? 'secondary'
                          : 'outline'
                    }
                    className="transition-transform group-hover:scale-105"
                  >
                    {offer.status}
                  </Badge>
                  {offer.launchDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <CalendarClock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(offer.launchDate), { addSuffix: true })}
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl">{offer.name}</CardTitle>
                {offer.topic && (
                  <CardDescription className="line-clamp-1">{offer.topic}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Value & Price */}
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div>
                    <p className="text-xs text-slate-500">Total Value</p>
                    <p className="text-lg font-semibold text-slate-900">
                      ${offer.totalValue.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Price</p>
                    <p className="text-lg font-semibold text-emerald-600">
                      ${offer.price.toFixed(2)}
                    </p>
                  </div>
                  {multiplier !== '0' && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Value</p>
                      <p className="text-lg font-semibold text-purple-600">{multiplier}x</p>
                    </div>
                  )}
                </div>

                {/* Products */}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Package className="h-4 w-4" />
                  <span>{offer.products.length} products</span>
                </div>

                {/* Progress */}
                {totalTasks > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium text-slate-900">
                        {completedTasks}/{totalTasks} tasks
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Task Stats */}
                {totalTasks > 0 && (
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      {completedTasks} done
                    </div>
                    <div className="flex items-center gap-1 text-amber-600">
                      <Clock className="h-3 w-3" />
                      {totalTasks - completedTasks} remaining
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
