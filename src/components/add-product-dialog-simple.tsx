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
import { createProduct } from '@/actions/product-actions'
import { getProblemsByOffer } from '@/actions/problem-actions'
import { improveName } from '@/actions/ai-actions'
import { Loader2, Sparkles } from 'lucide-react'
import { Problem } from '@prisma/client'

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

interface AddProductDialogSimpleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offerId: string
  onProductAdded: (product: any) => void
}

export function AddProductDialogSimple({
  open,
  onOpenChange,
  offerId,
  onProductAdded,
}: AddProductDialogSimpleProps) {
  const [loading, setLoading] = useState(false)
  const [problems, setProblems] = useState<Problem[]>([])
  const [step, setStep] = useState<'main' | 'ai-names'>('main')
  const [aiNames, setAiNames] = useState<string[]>([])
  const [formData, setFormData] = useState({
    problemId: '',
    deliveryFormat: '',
    customFormat: '',
    nameOption: 'own', // 'own' or 'ai'
    name: '',
    selectedAiName: '',
    value: '',
    isBonus: false,
  })

  useEffect(() => {
    if (open) {
      loadProblems()
      // Reset form
      setFormData({
        problemId: '',
        deliveryFormat: '',
        customFormat: '',
        nameOption: 'own',
        name: '',
        selectedAiName: '',
        value: '',
        isBonus: false,
      })
      setStep('main')
      setAiNames([])
    }
  }, [open, offerId])

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
      const productName =
        formData.nameOption === 'ai' ? formData.selectedAiName : formData.name

      const deliveryFormat =
        formData.deliveryFormat === 'Custom' ? formData.customFormat : formData.deliveryFormat

      const result = await createProduct({
        offerId,
        name: productName,
        value: parseFloat(formData.value) || 0,
        isBonus: formData.isBonus,
        problemId: formData.problemId || undefined,
        deliveryFormat: deliveryFormat || undefined,
      })

      if (result.success && result.product) {
        onProductAdded(result.product)
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error creating product:', error)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = () => {
    if (!formData.problemId || !formData.deliveryFormat || !formData.value) return false
    if (formData.deliveryFormat === 'Custom' && !formData.customFormat) return false
    if (formData.nameOption === 'own' && !formData.name) return false
    if (formData.nameOption === 'ai' && !formData.selectedAiName) return false
    return true
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'main' && (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Product or Bonus</DialogTitle>
              <DialogDescription>Quick setup for your product</DialogDescription>
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

              {/* Name Option */}
              <div className="space-y-3">
                <Label>Product Name *</Label>
                <RadioGroup
                  value={formData.nameOption}
                  onValueChange={(value: 'own' | 'ai') =>
                    setFormData({ ...formData, nameOption: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="own" id="own" />
                    <Label htmlFor="own" className="cursor-pointer font-normal">
                      I have a name
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ai" id="ai" />
                    <Label htmlFor="ai" className="cursor-pointer font-normal">
                      Let AI suggest names
                    </Label>
                  </div>
                </RadioGroup>

                {formData.nameOption === 'own' && (
                  <Input
                    placeholder="Enter product name..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                )}

                {formData.nameOption === 'ai' && (
                  <Button
                    type="button"
                    onClick={handleGenerateNames}
                    disabled={loading || !formData.problemId || !formData.deliveryFormat}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate 3 Names
                      </>
                    )}
                  </Button>
                )}
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
              <Button type="submit" disabled={loading || !canSubmit()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Product'
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
              <RadioGroup
                value={formData.selectedAiName}
                onValueChange={(value) => setFormData({ ...formData, selectedAiName: value })}
              >
                {aiNames.map((name, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                  >
                    <RadioGroupItem value={name} id={`name-${index}`} />
                    <Label
                      htmlFor={`name-${index}`}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
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
              <Button
                onClick={() => setStep('main')}
                disabled={!formData.selectedAiName || loading}
              >
                Use This Name
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
