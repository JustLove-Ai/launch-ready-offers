'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { updateProduct } from '@/actions/product-actions'
import { getProblemsByOffer } from '@/actions/problem-actions'
import { improveName } from '@/actions/ai-actions'
import { Loader2, Sparkles } from 'lucide-react'
import { Problem, Product } from '@prisma/client'

const DELIVERY_FORMATS = [
  'Online Course',
  'Video Training',
  'Ebook / PDF Guide',
  'Worksheet / Workbook',
  'Template Pack',
  'Checklist',
  'Swipe File',
  'Software / Tool',
  'Coaching Session',
  'Masterclass',
  'Email Series',
  'Audio Training',
  'Membership Access',
  'Custom',
]

interface EditProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product & { problemId?: string; deliveryFormat?: string }
  offerId: string
  onProductUpdated: (product: any) => void
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  offerId,
  onProductUpdated,
}: EditProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [problems, setProblems] = useState<Problem[]>([])
  const [step, setStep] = useState<'main' | 'ai-names'>('main')
  const [aiNames, setAiNames] = useState<string[]>([])
  const [formData, setFormData] = useState({
    problemId: product.problemId || '',
    deliveryFormat: product.deliveryFormat || '',
    customFormat: '',
    name: product.name,
    value: product.value.toString(),
    isBonus: product.isBonus,
  })

  useEffect(() => {
    if (open) {
      loadProblems()
      setFormData({
        problemId: product.problemId || '',
        deliveryFormat: product.deliveryFormat || '',
        customFormat: '',
        name: product.name,
        value: product.value.toString(),
        isBonus: product.isBonus,
      })
      setStep('main')
      setAiNames([])
    }
  }, [open, product, offerId])

  const loadProblems = async () => {
    const result = await getProblemsByOffer(offerId)
    if (result.success && result.problems) {
      setProblems(result.problems)
    }
  }

  const handleGenerateNames = async () => {
    if (!formData.problemId || !formData.deliveryFormat) {
      alert('Please select a problem and delivery format first')
      return
    }

    setLoading(true)
    try {
      const problem = problems.find((p) => p.id === formData.problemId)
      const deliveryFormat =
        formData.deliveryFormat === 'Custom' ? formData.customFormat : formData.deliveryFormat

      const context = `${deliveryFormat} that solves: ${problem?.title}`
      const result = await improveName('', context)

      if (result.success && result.names) {
        setAiNames(result.names.slice(0, 3))
        setStep('ai-names')
      }
    } catch (error) {
      console.error('Error generating names:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const deliveryFormat =
        formData.deliveryFormat === 'Custom' ? formData.customFormat : formData.deliveryFormat

      const result = await updateProduct(product.id, {
        name: formData.name,
        value: parseFloat(formData.value) || 0,
        isBonus: formData.isBonus,
        problemId: formData.problemId || undefined,
        deliveryFormat: deliveryFormat || undefined,
      })

      if (result.success && result.product) {
        onProductUpdated(result.product)
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error updating product:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'main' && (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update your product details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Problem Selection */}
              {problems.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="problemId">Which Problem? *</Label>
                  <Select
                    value={formData.problemId}
                    onValueChange={(value) => setFormData({ ...formData, problemId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a problem..." />
                    </SelectTrigger>
                    <SelectContent>
                      {problems.map((problem) => (
                        <SelectItem key={problem.id} value={problem.id}>
                          {problem.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Delivery Format */}
              <div className="space-y-2">
                <Label htmlFor="deliveryFormat">Packaging *</Label>
                <Select
                  value={formData.deliveryFormat}
                  onValueChange={(value) => setFormData({ ...formData, deliveryFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How will you deliver this?" />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_FORMATS.map((format) => (
                      <SelectItem key={format} value={format}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.deliveryFormat === 'Custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customFormat">Custom Format</Label>
                  <Input
                    id="customFormat"
                    placeholder="Enter your format..."
                    value={formData.customFormat}
                    onChange={(e) => setFormData({ ...formData, customFormat: e.target.value })}
                  />
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Product Name *</Label>
                  <Button
                    type="button"
                    onClick={handleGenerateNames}
                    disabled={loading || !formData.problemId || !formData.deliveryFormat}
                    variant="ghost"
                    size="sm"
                  >
                    <Sparkles className="mr-2 h-3 w-3" />
                    Generate Names
                  </Button>
                </div>
                <Input
                  placeholder="Enter product name..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Price and Bonus */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Price ($) *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    placeholder="197.00"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBonus"
                      checked={formData.isBonus}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isBonus: checked === true })
                      }
                    />
                    <Label htmlFor="isBonus" className="cursor-pointer font-normal">
                      Mark as bonus
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.name || !formData.value}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'ai-names' && (
          <div>
            <DialogHeader>
              <DialogTitle>Choose a Name</DialogTitle>
              <DialogDescription>Select one of these AI-generated names</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {aiNames.map((name, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full rounded-lg border border-slate-200 p-4 text-left transition-colors hover:bg-slate-50"
                  onClick={() => {
                    setFormData({ ...formData, name })
                    setStep('main')
                  }}
                >
                  <p className="font-medium">{name}</p>
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('main')}
                disabled={loading}
              >
                Back
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
