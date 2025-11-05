'use client'

import { Product, Task, SubTask } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, GripVertical, Pencil } from 'lucide-react'
import { deleteProduct } from '@/actions/product-actions'
import { useRouter } from 'next/navigation'

type ProductWithTasks = Product & {
  tasks: (Task & {
    subtasks: SubTask[]
  })[]
}

interface ProductListProps {
  products: ProductWithTasks[]
  offerId: string
  onUpdate: (data: any) => void
  onEdit: (product: ProductWithTasks) => void
}

export function ProductList({ products, offerId, onUpdate, onEdit }: ProductListProps) {
  const router = useRouter()

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    const result = await deleteProduct(productId)
    if (result.success) {
      router.refresh()
    }
  }

  if (products.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-500">No products yet. Add your first product!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <Card
          key={product.id}
          className="group relative cursor-move border-slate-200 p-4 transition-all hover:shadow-md"
        >
          <div className="flex items-start gap-3">
            <div className="cursor-grab pt-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-slate-900">{product.name}</h3>
                  {product.isBonus && (
                    <Badge variant="secondary" className="text-xs">
                      BONUS
                    </Badge>
                  )}
                </div>
                <p className="text-lg font-semibold text-purple-600">
                  ${product.value.toFixed(0)}
                </p>
              </div>
              {product.description && (
                <p className="mb-2 text-sm text-slate-600 line-clamp-2">{product.description}</p>
              )}
              {((product as any).problem || product.solution) && (
                <div className="mt-2 space-y-1 text-xs">
                  {(product as any).problem && (
                    <p className="text-slate-500">
                      <span className="font-medium">Problem:</span>{' '}
                      {typeof (product as any).problem === 'object'
                        ? (product as any).problem.title
                        : (product as any).problem}
                    </p>
                  )}
                  {product.solution && (
                    <p className="text-slate-500">
                      <span className="font-medium">Solution:</span> {product.solution}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 opacity-0 transition-opacity hover:text-blue-600 group-hover:opacity-100"
                onClick={() => onEdit(product)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                onClick={() => handleDelete(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
