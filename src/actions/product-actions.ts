'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { calculateOfferTotals } from './offer-actions'

export async function createProduct(data: {
  offerId: string
  name: string
  description?: string
  value: number
  isBonus?: boolean
  problemId?: string
  deliveryFormat?: string
  solution?: string
}) {
  try {
    // Get the highest order number for this offer
    const lastProduct = await prisma.product.findFirst({
      where: { offerId: data.offerId },
      orderBy: { order: 'desc' },
    })

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        value: data.value,
        isBonus: data.isBonus || false,
        problemId: data.problemId,
        deliveryFormat: data.deliveryFormat,
        solution: data.solution,
        offerId: data.offerId,
        order: (lastProduct?.order || 0) + 1,
      },
      include: {
        tasks: {
          include: {
            subtasks: true,
          },
        },
      },
    })

    // Recalculate offer totals
    await calculateOfferTotals(data.offerId)

    revalidatePath(`/offer/${data.offerId}`)
    return { success: true, product }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

export async function updateProduct(
  id: string,
  data: {
    name?: string
    description?: string
    value?: number
    isBonus?: boolean
    problem?: string
    solution?: string
    order?: number
  }
) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        tasks: {
          include: {
            subtasks: true,
          },
        },
      },
    })

    // Recalculate offer totals if value changed
    if (data.value !== undefined) {
      await calculateOfferTotals(product.offerId)
    }

    revalidatePath(`/offer/${product.offerId}`)
    return { success: true, product }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    await prisma.product.delete({
      where: { id },
    })

    // Recalculate offer totals
    await calculateOfferTotals(product.offerId)

    revalidatePath(`/offer/${product.offerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}

export async function reorderProducts(offerId: string, productIds: string[]) {
  try {
    // Update each product with its new order
    await Promise.all(
      productIds.map((productId, index) =>
        prisma.product.update({
          where: { id: productId },
          data: { order: index },
        })
      )
    )

    revalidatePath(`/offer/${offerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error reordering products:', error)
    return { success: false, error: 'Failed to reorder products' }
  }
}
