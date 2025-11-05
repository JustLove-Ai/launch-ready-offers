'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createProduct } from '@/actions/product-actions'
import { getProblemsByOffer } from '@/actions/problem-actions'
import { Loader2 } from 'lucide-react'
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

interface AddProductDialogUpdatedProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offerId: string
  onSuccess?: (data: any) => void
}

export function AddProductDialogUpdated({
  open,
  onOpenChange,
  offerId,
  onSuccess,
}: AddProductDialogUpdatedProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [problems, setProblems] = useState<Problem[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    isBonus: false,
    problemId: '',
    deliveryFormat: '',
    customFormat: '',
    solution: '',
  })

  useEffect(() => {
    if (open) {
      loadProblems()
    }
  }, [open, offerId])

  const loadProblems = async () => {
    const result = await getProblemsByOffer(offerId)
    if (result.success && result.problems) {
      setProblems(result.problems)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const deliveryFormat =
        formData.deliveryFormat === 'Custom' ? formData.customFormat : formData.deliveryFormat

      const result = await createProduct({
        offerId,
        name: formData.name,
        description: formData.description || undefined,
        value: parseFloat(formData.value) || 0,
        isBonus: formData.isBonus,
        problemId: formData.problemId || undefined,
        deliveryFormat: deliveryFormat || undefined,
        solution: formData.solution || undefined,
      })

      if (result.success) {
        onOpenChange(false)
        setFormData({
          name: '',
          description: '',
          value: '',
          isBonus: false,
          problemId: '',
          deliveryFormat: '',
          customFormat: '',
          solution: '',
        })
        router.refresh()
      }
    } catch (error) {
      console.error('Error creating product:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Product or Bonus</DialogTitle>
            <DialogDescription>Create a solution for one of your problems.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {problems.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="problemId">Which Problem Does This Solve?</Label>
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

            <div className="space-y-2">
              <Label htmlFor="deliveryFormat">How Will You Package This?</Label>
              <Select
                value={formData.deliveryFormat}
                onValueChange={(value) => setFormData({ ...formData, deliveryFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery format..." />
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
                  placeholder="Enter your custom format..."
                  value={formData.customFormat}
                  onChange={(e) => setFormData({ ...formData, customFormat: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g., The Ultimate Content Calendar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this product include?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Perceived Value ($) *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="solution">How Does It Solve The Problem?</Label>
              <Textarea
                id="solution"
                placeholder="Describe the transformation or solution..."
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                rows={2}
              />
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
                  Adding...
                </>
              ) : (
                'Add Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
