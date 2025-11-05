import { getOffers } from '@/actions/offer-actions'
import { OffersTable } from '@/components/offers-table'
import { Button } from '@/components/ui/button'
import { Sparkles, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function Home() {
  const { offers } = await getOffers()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                Launch Ready Offers
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                Turn ideas into launched products with AI-powered guidance
              </p>
            </div>
            <Link href="/offer/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Offer
              </Button>
            </Link>
          </div>
        </div>

        {/* Offers Table */}
        {offers && offers.length > 0 ? (
          <OffersTable offers={offers} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/50 px-4 py-24 backdrop-blur-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-slate-900">
              Create your first offer
            </h2>
            <p className="mb-8 max-w-md text-center text-slate-600">
              Let AI help you build a compelling offer stack with problem-solving products
              your audience will love
            </p>
            <Link href="/offer/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Offer
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
