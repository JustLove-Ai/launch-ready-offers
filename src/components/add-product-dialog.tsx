'use client'

import { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { createProduct } from '@/actions/product-actions'
import { Loader2 } from 'lucide-react'

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offerId: string
  onSuccess?: (data: any) => void
}

export function AddProductDialog({ open, onOpenChange, offerId, onSuccess }: AddProductDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    isBonus: false,
    problem: '',
    solution: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createProduct({
        offerId,
        name: formData.name,
        description: formData.description || undefined,
        value: parseFloat(formData.value) || 0,
        isBonus: formData.isBonus,
        problem: formData.problem || undefined,
        solution: formData.solution || undefined,
      })

      if (result.success) {
        onOpenChange(false)
        setFormData({
          name: '',
          description: '',
          value: '',
          isBonus: false,
          problem: '',
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
            <DialogDescription>
              Create a new product for your offer stack.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
            <div className="space-y-2">
              <Label htmlFor="problem">Problem It Solves</Label>
              <Textarea
                id="problem"
                placeholder="What specific problem does this address?"
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="solution">Solution It Provides</Label>
              <Textarea
                id="solution"
                placeholder="How does it solve the problem?"
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
