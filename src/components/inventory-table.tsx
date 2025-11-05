'use client'

import { useState, useMemo } from 'react'
import { InventoryProduct, Product, Offer } from '@prisma/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Search, Edit2, Trash2, Package } from 'lucide-react'
import { deleteInventoryProduct } from '@/actions/inventory-actions'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

type InventoryProductWithUsage = InventoryProduct & {
  products: (Product & {
    offer: {
      id: string
      name: string
    }
  })[]
}

interface InventoryTableProps {
  products: InventoryProductWithUsage[]
}

export function InventoryTable({ products: initialProducts }: InventoryTableProps) {
  const [products, setProducts] = useState(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [tagFilter, setTagFilter] = useState<string>('all')

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    products.forEach(product => {
      if (product.tags) {
        product.tags.forEach(tag => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [products])

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.deliveryFormat?.toLowerCase().includes(searchQuery.toLowerCase())

      // Tag filter
      const matchesTag = tagFilter === 'all' || (product.tags && product.tags.includes(tagFilter))

      return matchesSearch && matchesTag
    })
  }, [products, searchQuery, tagFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product from inventory?')) {
      return
    }

    const result = await deleteInventoryProduct(id)
    if (result.success) {
      setProducts(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Times Used</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  No products match your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.deliveryFormat ? (
                      <Badge variant="outline" className="capitalize">
                        {product.deliveryFormat}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">${product.value}</span>
                  </TableCell>
                  <TableCell>
                    {product.tags && product.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {product.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{product.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.products.length > 0 ? (
                      <div>
                        <span className="font-medium">{product.products.length}x</span>
                        <div className="text-xs text-slate-500 mt-1">
                          {product.products.slice(0, 2).map((p, i) => (
                            <div key={i}>
                              <Link
                                href={`/offer/${p.offer.id}`}
                                className="hover:underline text-blue-600"
                              >
                                {p.offer.name}
                              </Link>
                            </div>
                          ))}
                          {product.products.length > 2 && (
                            <div>+{product.products.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">Not used</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/inventory/${product.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
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
      </Card>

      {/* Results Count */}
      <div className="text-sm text-slate-600">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  )
}
