'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Trash2, Plus, Edit2, Check, X, Package, Archive } from 'lucide-react'
import { OfferData, ProductIdea } from '@/app/offer/create/page'
import { useState, useEffect } from 'react'
import { generateProductIdeas } from '@/actions/ai-actions'
import { getInventoryProducts } from '@/actions/inventory-actions'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { InventoryProduct } from '@prisma/client'

interface StepThreeProps {
  offerData: OfferData
  updateOfferData: (data: Partial<OfferData>) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const deliveryFormats = [
  'ebook',
  'course',
  'video series',
  'template',
  'worksheet',
  'checklist',
  'guide',
  'toolkit',
  'software',
  'membership',
  'coaching',
  'consulting'
]

export function StepThree({ offerData, updateOfferData, isLoading, setIsLoading }: StepThreeProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ProductIdea | null>(null)
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([])
  const [showInventoryDialog, setShowInventoryDialog] = useState(false)
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    const result = await getInventoryProducts()
    if (result.success && result.products) {
      setInventoryProducts(result.products)
    }
  }

  const addFromInventory = () => {
    const selectedProducts = inventoryProducts
      .filter(p => selectedInventoryIds.has(p.id))
      .map(p => ({
        id: `product-${Date.now()}-${p.id}`,
        name: p.name,
        description: p.description || '',
        value: p.value,
        deliveryFormat: p.deliveryFormat || 'ebook',
        solution: p.solution || '',
        isBonus: false
      }))

    updateOfferData({
      productIdeas: [...offerData.productIdeas, ...selectedProducts]
    })

    setSelectedInventoryIds(new Set())
    setShowInventoryDialog(false)
  }

  const toggleInventorySelection = (id: string) => {
    const newSet = new Set(selectedInventoryIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedInventoryIds(newSet)
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const result = await generateProductIdeas(
        offerData.description,
        offerData.problems
      )
      if (result.success && result.productIdeas) {
        updateOfferData({ productIdeas: result.productIdeas })
      }
    } catch (error) {
      console.error('Error generating product ideas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (product: ProductIdea) => {
    setEditingId(product.id)
    setEditForm({ ...product })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const saveEditing = () => {
    if (editForm) {
      updateOfferData({
        productIdeas: offerData.productIdeas.map(p => p.id === editForm.id ? editForm : p)
      })
      cancelEditing()
    }
  }

  const removeProduct = (id: string) => {
    updateOfferData({
      productIdeas: offerData.productIdeas.filter(p => p.id !== id)
    })
  }

  const addNewProduct = () => {
    const newProduct: ProductIdea = {
      id: `product-${Date.now()}`,
      name: '',
      description: '',
      value: 0,
      deliveryFormat: 'ebook',
      solution: '',
      isBonus: false
    }
    updateOfferData({
      productIdeas: [...offerData.productIdeas, newProduct]
    })
    startEditing(newProduct)
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          Add products manually, select from inventory, or use AI to generate product ideas based on your problems.
        </AlertDescription>
      </Alert>

      {/* Action Buttons - Always Visible */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {offerData.productIdeas.length === 0 ? 'Add Products' : `Products (${offerData.productIdeas.length})`}
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={addNewProduct}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Manually
          </Button>
          {inventoryProducts.length > 0 && (
            <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Archive className="h-4 w-4" />
                  From Inventory
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select from Inventory</DialogTitle>
                  <DialogDescription>
                    Choose products from your inventory to add to this offer
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {inventoryProducts.map(product => (
                    <Card
                      key={product.id}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedInventoryIds.has(product.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-slate-300'
                      }`}
                      onClick={() => toggleInventorySelection(product.id)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedInventoryIds.has(product.id)}
                          onChange={() => toggleInventorySelection(product.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{product.name}</h4>
                              {product.deliveryFormat && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {product.deliveryFormat}
                                </Badge>
                              )}
                            </div>
                            <span className="font-semibold">${product.value}</span>
                          </div>
                          {product.description && (
                            <p className="text-sm text-slate-600">{product.description}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedInventoryIds(new Set())
                      setShowInventoryDialog(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addFromInventory}
                    disabled={selectedInventoryIds.size === 0}
                  >
                    Add {selectedInventoryIds.size > 0 ? `(${selectedInventoryIds.size})` : ''}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || offerData.problems.length === 0}
            size="sm"
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            <Sparkles className="h-4 w-4" />
            {isLoading ? 'Generating...' : offerData.productIdeas.length === 0 ? 'Generate with AI' : 'Regenerate'}
          </Button>
        </div>
      </div>

      {/* Products List or Empty State */}
      {offerData.productIdeas.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-slate-500">
            <p className="mb-4">No products added yet.</p>
            <p className="text-sm">
              Add products manually, select from inventory{inventoryProducts.length > 0 ? ` (${inventoryProducts.length} available)` : ''},
              or use AI to generate ideas based on your problems.
            </p>
            {offerData.problems.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                Note: AI generation requires problems from the previous step.
              </p>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {offerData.productIdeas.map((product, index) => (
            <Card key={product.id} className="p-4">
              {editingId === product.id && editForm ? (
                <div className="space-y-4">
                  <div>
                    <Label>Product Name *</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g., Social Media Content Calendar Template"
                    />
                  </div>
                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Describe what this product includes..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Value ($) *</Label>
                      <Input
                        type="number"
                        value={editForm.value}
                        onChange={(e) => setEditForm({ ...editForm, value: parseFloat(e.target.value) || 0 })}
                        placeholder="97"
                      />
                    </div>
                    <div>
                      <Label>Delivery Format *</Label>
                      <Select
                        value={editForm.deliveryFormat}
                        onValueChange={(value) => setEditForm({ ...editForm, deliveryFormat: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {deliveryFormats.map(format => (
                            <SelectItem key={format} value={format}>
                              {format}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Solution / How it helps</Label>
                    <Textarea
                      value={editForm.solution}
                      onChange={(e) => setEditForm({ ...editForm, solution: e.target.value })}
                      placeholder="Explain how this product solves the problem..."
                      rows={2}
                    />
                  </div>
                  {offerData.problems.length > 0 && (
                    <div>
                      <Label>Links to Problem</Label>
                      <Select
                        value={editForm.problemId || 'none'}
                        onValueChange={(value) => setEditForm({ ...editForm, problemId: value === 'none' ? undefined : value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {offerData.problems.map(problem => (
                            <SelectItem key={problem.id} value={problem.id}>
                              {problem.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={saveEditing} size="sm" className="gap-2">
                      <Check className="h-4 w-4" />
                      Save
                    </Button>
                    <Button onClick={cancelEditing} variant="outline" size="sm" className="gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2">
                      <Package className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-base">{product.name}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {product.deliveryFormat}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => startEditing(product)}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => removeProduct(product.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{product.description}</p>
                  {product.solution && (
                    <p className="text-sm text-emerald-600 mb-3">
                      ✓ {product.solution}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-lg font-semibold text-slate-900">
                      ${product.value}
                    </span>
                    {product.problemId && (
                      <span className="text-xs text-slate-500">
                        Solves: {offerData.problems.find(p => p.id === product.problemId)?.title}
                      </span>
                    )}
                  </div>
                </>
              )}
              </Card>
            ))}
          </div>
      )}
    </div>
  )
}
