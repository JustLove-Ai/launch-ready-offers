'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Check, Package, Gift, Rocket } from 'lucide-react'
import { OfferData } from '@/app/offer/create/page'
import { useState } from 'react'
import { createFullOffer } from '@/actions/offer-actions'
import { format } from 'date-fns'

interface StepFiveProps {
  offerData: OfferData
  updateOfferData: (data: Partial<OfferData>) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  onComplete: (offerId: string) => void
}

export function StepFive({ offerData, updateOfferData, isLoading, setIsLoading, onComplete }: StepFiveProps) {
  const [error, setError] = useState<string>('')

  const totalValue = offerData.selectedProducts.reduce((sum, p) => sum + p.value, 0)
  const mainProducts = offerData.selectedProducts.filter(p => !p.isBonus)
  const bonuses = offerData.selectedProducts.filter(p => p.isBonus)

  const handleCreate = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await createFullOffer({
        name: offerData.name,
        topic: offerData.topic,
        description: offerData.description,
        tags: offerData.tags,
        price: offerData.price,
        totalValue,
        launchDate: offerData.launchDate,
        problems: offerData.problems,
        products: offerData.selectedProducts
      })

      if (result.success && result.offer) {
        onComplete(result.offer.id)
      } else {
        setError(result.error || 'Failed to create offer')
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error('Error creating offer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const valueMultiplier = offerData.price > 0 ? (totalValue / offerData.price).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      <Alert>
        <Check className="h-4 w-4" />
        <AlertDescription>
          Review your offer details and set your price. When you're ready, click "Create Offer" to launch!
        </AlertDescription>
      </Alert>

      {/* Offer Details */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">{offerData.name}</h3>
        {offerData.topic && (
          <p className="text-slate-600 mb-4">{offerData.topic}</p>
        )}
        {offerData.description && (
          <p className="text-sm text-slate-600 mb-4">{offerData.description}</p>
        )}
        {offerData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {offerData.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Problems Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Problems Addressed ({offerData.problems.length})
        </h3>
        <div className="space-y-3">
          {offerData.problems.map((problem, index) => (
            <div key={problem.id} className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-semibold text-xs flex-shrink-0">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-sm">{problem.title}</p>
                {problem.emotionalHook && (
                  <p className="text-xs text-slate-500 italic">{problem.emotionalHook}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Products Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Products Included ({offerData.selectedProducts.length})
        </h3>

        {/* Main Products */}
        {mainProducts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-slate-600" />
              <h4 className="font-semibold text-sm">Main Products</h4>
            </div>
            <div className="space-y-2 pl-6">
              {mainProducts.map(product => (
                <div key={product.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.deliveryFormat}</p>
                  </div>
                  <span className="font-semibold text-slate-900">${product.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bonuses */}
        {bonuses.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-4 w-4 text-emerald-600" />
              <h4 className="font-semibold text-sm">Bonus Products</h4>
            </div>
            <div className="space-y-2 pl-6">
              {bonuses.map(product => (
                <div key={product.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.deliveryFormat}</p>
                  </div>
                  <span className="font-semibold text-emerald-600">${product.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Value */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Value</span>
            <span className="text-2xl font-bold text-purple-600">${totalValue.toFixed(0)}</span>
          </div>
        </div>
      </Card>

      {/* Pricing */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Pricing</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="price" className="text-base mb-2">
              Your Price *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <Input
                id="price"
                type="number"
                value={offerData.price || ''}
                onChange={(e) => updateOfferData({ price: parseFloat(e.target.value) || 0 })}
                className="pl-7 text-lg"
                placeholder="97"
                disabled={isLoading}
              />
            </div>
          </div>

          {offerData.price > 0 && (
            <div className="flex items-end">
              <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-blue-50 p-4 w-full">
                <p className="text-sm text-slate-600 mb-1">Value Multiplier</p>
                <p className="text-3xl font-bold text-purple-600">{valueMultiplier}x</p>
                <p className="text-xs text-slate-500">
                  ${totalValue.toFixed(0)} value for ${offerData.price.toFixed(0)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Launch Date */}
        <div className="mt-6">
          <Label className="text-base mb-2">Launch Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {offerData.launchDate ? (
                  format(offerData.launchDate, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={offerData.launchDate}
                onSelect={(date) => updateOfferData({ launchDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Create Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleCreate}
          disabled={isLoading || !offerData.price || offerData.selectedProducts.length === 0}
          size="lg"
          className="gap-2"
        >
          <Rocket className="h-5 w-5" />
          {isLoading ? 'Creating Offer...' : 'Create Offer'}
        </Button>
      </div>
    </div>
  )
}
