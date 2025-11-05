'use client'

import { useState } from 'react'
import { Offer, Product, Task, SubTask } from '@prisma/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { ProductsTab } from '@/components/products-tab'
import { TasksTab } from '@/components/tasks-tab'
import { ProblemsTab } from '@/components/problems-tab'
import { OfferHeader } from '@/components/offer-header'

type OfferWithRelations = Offer & {
  products: (Product & {
    tasks: (Task & {
      subtasks: SubTask[]
    })[]
  })[]
}

interface OfferEditorProps {
  offer: OfferWithRelations
}

export function OfferEditor({ offer: initialOffer }: OfferEditorProps) {
  const [offer, setOffer] = useState(initialOffer)
  const [activeTab, setActiveTab] = useState('products')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-[1800px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">{offer.name}</h1>
                {offer.topic && <p className="text-sm text-slate-600">{offer.topic}</p>}
              </div>
            </div>
            <OfferHeader offer={offer} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-[1800px] px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-white">
            <TabsTrigger value="products" className="px-6">
              Products & Bonuses
            </TabsTrigger>
            <TabsTrigger value="problems" className="px-6">
              Problems & Solutions
            </TabsTrigger>
            <TabsTrigger value="tasks" className="px-6">
              Launch Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-0">
            <ProductsTab offer={offer} onUpdate={setOffer} />
          </TabsContent>

          <TabsContent value="problems" className="mt-0">
            <ProblemsTab offer={offer} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <TasksTab offer={offer} onUpdate={setOffer} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
