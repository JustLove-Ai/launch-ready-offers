import { getInventoryProducts } from '@/actions/inventory-actions'
import { InventoryTable } from '@/components/inventory-table'
import { Button } from '@/components/ui/button'
import { Package, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function InventoryPage() {
  const { products } = await getInventoryProducts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                  Product Inventory
                </h1>
              </div>
              <p className="mt-2 text-lg text-slate-600">
                Manage your completed products and reuse them in future offers
              </p>
            </div>
            <Link href="/inventory/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Products Table */}
        {products && products.length > 0 ? (
          <InventoryTable products={products} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/50 px-4 py-24 backdrop-blur-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-slate-900">
              No products in inventory yet
            </h2>
            <p className="mb-8 max-w-md text-center text-slate-600">
              When you complete products in your offers, you can add them here for reuse in future offers
            </p>
            <Link href="/inventory/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Add First Product
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
