'use client'

import { useState } from 'react'
import { Offer, Product, Task, SubTask } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { AddProductDialogSimple } from '@/components/add-product-dialog-simple'
import { EditProductDialog } from '@/components/edit-product-dialog'
import { AISuggestionsDialog } from '@/components/ai-suggestions-dialog'
import { OfferPreviewPanel } from '@/components/offer-preview-panel'
import { deleteProduct } from '@/actions/product-actions'
import { useRouter } from 'next/navigation'

type OfferWithRelations = Offer & {
  products: (Product & {
    tasks: (Task & {
      subtasks: SubTask[]
    })[]
  })[]
}

interface ProductsViewProps {
  offer: OfferWithRelations
}

export function ProductsView({ offer: initialOffer }: ProductsViewProps) {
  const router = useRouter()
  const [offer, setOffer] = useState(initialOffer)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [localProducts, setLocalProducts] = useState(offer.products)
  const [editingProduct, setEditingProduct] = useState<(Product & { problemId?: string; deliveryFormat?: string }) | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleProductAdded = (newProduct: any) => {
    const updatedProducts = [...localProducts, newProduct]
    setLocalProducts(updatedProducts)
    const newTotalValue = updatedProducts.reduce((sum, p) => sum + p.value, 0)
    setOffer({
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
    const updatedProducts = localProducts.map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    )
    setLocalProducts(updatedProducts)
    const newTotalValue = updatedProducts.reduce((sum, p) => sum + p.value, 0)
    setOffer({
      ...offer,
      products: updatedProducts,
      totalValue: newTotalValue,
    })
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    const result = await deleteProduct(productId)
    if (result.success) {
      const updatedProducts = localProducts.filter((p) => p.id !== productId)
      setLocalProducts(updatedProducts)
      router.refresh()
    }
  }

  const filteredProducts = localProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAIDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:scale-[1.02]"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Suggestions
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] flex-1 overflow-hidden">
        {/* Products Table */}
        <Card className="flex flex-col overflow-hidden">
          <div className="p-6 pb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold text-slate-900">Products & Bonuses</h2>
          </div>
          <div className="flex-1 overflow-auto px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <p className="text-sm text-slate-500">
                        {searchQuery ? 'No products found.' : 'No products yet. Add your first product!'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.name}</span>
                          {product.isBonus && (
                            <Badge variant="secondary" className="text-xs">
                              BONUS
                            </Badge>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-sm text-slate-500 line-clamp-1">{product.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {(product as any).deliveryFormat ? (
                          <Badge variant="outline" className="text-xs">
                            {(product as any).deliveryFormat}
                          </Badge>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-purple-600">${product.value.toFixed(0)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                            className="hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Live Preview */}
        <div className="overflow-hidden">
          <OfferPreviewPanel offer={{ ...offer, products: localProducts }} />
        </div>
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
        onSuccess={setOffer}
      />
    </div>
  )
}
