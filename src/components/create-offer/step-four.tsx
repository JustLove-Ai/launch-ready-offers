'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Package, Gift, Zap } from 'lucide-react'
import { OfferData, ProductIdea } from '@/app/offer/create/page'
import { useState, useEffect } from 'react'
import { selectBestProducts } from '@/actions/ai-actions'

interface StepFourProps {
  offerData: OfferData
  updateOfferData: (data: Partial<OfferData>) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function StepFour({ offerData, updateOfferData, isLoading, setIsLoading }: StepFourProps) {
  const [recommendations, setRecommendations] = useState<{
    mainProducts: string[]
    bonuses: string[]
    reasoning: string
  } | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const result = await selectBestProducts(
        offerData.description,
        offerData.productIdeas
      )
      if (result.success && result.selection) {
        setRecommendations(result.selection)

        // Auto-apply AI recommendations
        const selected = offerData.productIdeas.map(product => {
          const isMain = result.selection?.mainProducts.includes(product.id)
          const isBonus = result.selection?.bonuses.includes(product.id)

          if (isMain || isBonus) {
            return {
              ...product,
              isBonus: isBonus
            }
          }
          return null
        }).filter((p): p is ProductIdea => p !== null)

        updateOfferData({ selectedProducts: selected })
      }
    } catch (error) {
      console.error('Error selecting products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleProduct = (product: ProductIdea) => {
    const isSelected = offerData.selectedProducts.some(p => p.id === product.id)

    if (isSelected) {
      // Remove from selection
      updateOfferData({
        selectedProducts: offerData.selectedProducts.filter(p => p.id !== product.id)
      })
    } else {
      // Add to selection
      updateOfferData({
        selectedProducts: [...offerData.selectedProducts, product]
      })
    }
  }

  const toggleBonus = (productId: string) => {
    updateOfferData({
      selectedProducts: offerData.selectedProducts.map(p =>
        p.id === productId ? { ...p, isBonus: !p.isBonus } : p
      )
    })
  }

  const isSelected = (productId: string) => {
    return offerData.selectedProducts.some(p => p.id === productId)
  }

  const getProduct = (productId: string) => {
    return offerData.selectedProducts.find(p => p.id === productId)
  }

  const totalValue = offerData.selectedProducts
    .reduce((sum, p) => sum + p.value, 0)

  const mainProductsValue = offerData.selectedProducts
    .filter(p => !p.isBonus)
    .reduce((sum, p) => sum + p.value, 0)

  const bonusValue = offerData.selectedProducts
    .filter(p => p.isBonus)
    .reduce((sum, p) => sum + p.value, 0)

  return (
    <div className="space-y-6">
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          AI will analyze your product ideas and recommend the best combination for your offer.
          It will suggest which products should be main offerings and which should be bonuses.
        </AlertDescription>
      </Alert>

      {!recommendations ? (
        <div className="text-center py-12">
          <Button
            onClick={handleGenerate}
            disabled={isLoading || offerData.productIdeas.length === 0}
            size="lg"
            className="gap-2"
          >
            <Sparkles className="h-5 w-5" />
            {isLoading ? 'Analyzing Products...' : 'Get AI Recommendations'}
          </Button>
          {offerData.productIdeas.length === 0 && (
            <p className="text-sm text-slate-500 mt-4">
              Please add product ideas in the previous step first
            </p>
          )}
        </div>
      ) : (
        <>
          {/* AI Reasoning */}
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex gap-3">
              <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">AI Recommendation</h3>
                <p className="text-sm text-purple-700">{recommendations.reasoning}</p>
              </div>
            </div>
          </Card>

          {/* Product Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Products for Your Offer</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {offerData.productIdeas.map((product) => {
                const selected = isSelected(product.id)
                const selectedProduct = getProduct(product.id)
                const isMainRecommended = recommendations.mainProducts.includes(product.id)
                const isBonusRecommended = recommendations.bonuses.includes(product.id)

                return (
                  <Card
                    key={product.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selected
                        ? 'border-purple-500 bg-purple-50'
                        : 'hover:border-slate-300'
                    }`}
                    onClick={() => toggleProduct(product)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleProduct(product)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{product.name}</h4>
                            {isMainRecommended && (
                              <Badge variant="default" className="text-xs gap-1">
                                <Package className="h-3 w-3" />
                                Main
                              </Badge>
                            )}
                            {isBonusRecommended && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Gift className="h-3 w-3" />
                                Bonus
                              </Badge>
                            )}
                          </div>
                          <span className="font-semibold text-slate-900">
                            ${product.value}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 mb-3">{product.description}</p>

                        {selected && (
                          <div className="pt-3 border-t">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={selectedProduct?.isBonus}
                                onCheckedChange={(e) => {
                                  e.stopPropagation()
                                  toggleBonus(product.id)
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-sm font-medium">
                                Include as bonus product
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Value Summary */}
          {offerData.selectedProducts.length > 0 && (
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-blue-50">
              <h3 className="text-lg font-semibold mb-4">Offer Value Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Main Products</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${mainProductsValue.toFixed(0)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {offerData.selectedProducts.filter(p => !p.isBonus).length} products
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Bonus Value</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${bonusValue.toFixed(0)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {offerData.selectedProducts.filter(p => p.isBonus).length} bonuses
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${totalValue.toFixed(0)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {offerData.selectedProducts.length} total items
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Regenerate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Get New Recommendations
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
