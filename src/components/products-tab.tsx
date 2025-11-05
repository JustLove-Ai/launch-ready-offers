'use client'

import { useState } from 'react'
import { Offer, Product, Task, SubTask } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles } from 'lucide-react'
import { ProductList } from '@/components/product-list'
import { OfferPreview } from '@/components/offer-preview'
import { AddProductDialogSimple } from '@/components/add-product-dialog-simple'
import { EditProductDialog } from '@/components/edit-product-dialog'
import { AISuggestionsDialog } from '@/components/ai-suggestions-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lightbulb } from 'lucide-react'

type OfferWithRelations = Offer & {
  products: (Product & {
    tasks: (Task & {
      subtasks: SubTask[]
    })[]
  })[]
}

interface ProductsTabProps {
  offer: OfferWithRelations
  onUpdate: (offer: OfferWithRelations) => void
}

export function ProductsTab({ offer, onUpdate }: ProductsTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [localProducts, setLocalProducts] = useState(offer.products)
  const [editingProduct, setEditingProduct] = useState<(Product & { problemId?: string; deliveryFormat?: string }) | null>(null)

  const multiplier = offer.price > 0 ? offer.totalValue / offer.price : 0

  const handleProductAdded = (newProduct: any) => {
    // Immediately update local state
    const updatedProducts = [...localProducts, newProduct]
    setLocalProducts(updatedProducts)

    // Update parent state with new total value
    const newTotalValue = updatedProducts.reduce((sum, p) => sum + p.value, 0)
    onUpdate({
      ...offer,
      products: updatedProducts,
      totalValue: newTotalValue,
    })
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setShowEditDialog(true)
  }

  const handleProductUpdated = (updatedProduct: any) => {
    // Immediately update local state
    const updatedProducts = localProducts.map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    )
    setLocalProducts(updatedProducts)

    // Update parent state with new total value
    const newTotalValue = updatedProducts.reduce((sum, p) => sum + p.value, 0)
    onUpdate({
      ...offer,
      products: updatedProducts,
      totalValue: newTotalValue,
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      {/* Left Sidebar - Products List */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Products & Bonuses</h2>

          {/* Action Buttons */}
          <div className="mb-4 space-y-2">
            <Button
              onClick={() => setShowAIDialog(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:scale-[1.02] hover:shadow-xl"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate AI Suggestions
            </Button>
            <Button
              onClick={() => setShowAddDialog(true)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Product
            </Button>
          </div>

          {/* Products List */}
          <ProductList
            products={localProducts}
            offerId={offer.id}
            onUpdate={onUpdate}
            onEdit={handleEditProduct}
          />
        </div>

        {/* Value Analysis Tip */}
        {multiplier > 0 && multiplier < 10 && (
          <Alert className="border-amber-200 bg-amber-50">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
              Tip: Aim for at least 10x value! Add more products or increase their perceived value
              to make your offer irresistible.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Right Side - Live Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Live Preview</h2>
          <p className="text-sm text-slate-600">Your stack slide updates in real-time</p>
        </div>
        <OfferPreview offer={{ ...offer, products: localProducts }} />
      </div>

      {/* Dialogs */}
      <AddProductDialogSimple
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        offerId={offer.id}
        onProductAdded={handleProductAdded}
      />
      {editingProduct && (
        <EditProductDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          product={editingProduct}
          offerId={offer.id}
          onProductUpdated={handleProductUpdated}
        />
      )}
      <AISuggestionsDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        offer={offer}
        onSuccess={onUpdate}
      />
    </div>
  )
}
