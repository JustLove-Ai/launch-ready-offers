'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getInventoryProducts() {
  try {
    const products = await prisma.inventoryProduct.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          include: {
            offer: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    })
    return { success: true, products }
  } catch (error) {
    console.error('Error fetching inventory products:', error)
    return { success: false, error: 'Failed to fetch inventory products' }
  }
}

export async function createInventoryProduct(data: {
  name: string
  description?: string
  value: number
  deliveryFormat?: string
  solution?: string
  tags: string[]
}) {
  try {
    const product = await prisma.inventoryProduct.create({
      data: {
        name: data.name,
        description: data.description,
        value: data.value,
        deliveryFormat: data.deliveryFormat,
        solution: data.solution,
        tags: data.tags,
      }
    })
    revalidatePath('/inventory')
    return { success: true, product }
  } catch (error) {
    console.error('Error creating inventory product:', error)
    return { success: false, error: 'Failed to create inventory product' }
  }
}

export async function updateInventoryProduct(
  id: string,
  data: {
    name?: string
    description?: string
    value?: number
    deliveryFormat?: string
    solution?: string
    tags?: string[]
  }
) {
  try {
    const product = await prisma.inventoryProduct.update({
      where: { id },
      data,
    })
    revalidatePath('/inventory')
    return { success: true, product }
  } catch (error) {
    console.error('Error updating inventory product:', error)
    return { success: false, error: 'Failed to update inventory product' }
  }
}

export async function deleteInventoryProduct(id: string) {
  try {
    await prisma.inventoryProduct.delete({
      where: { id },
    })
    revalidatePath('/inventory')
    return { success: true }
  } catch (error) {
    console.error('Error deleting inventory product:', error)
    return { success: false, error: 'Failed to delete inventory product' }
  }
}

export async function addProductToInventory(productId: string) {
  try {
    // Get the product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    // Check if already added to inventory
    if (product.isAddedToInventory) {
      return { success: false, error: 'Product already in inventory' }
    }

    // Create inventory product
    const inventoryProduct = await prisma.inventoryProduct.create({
      data: {
        name: product.name,
        description: product.description,
        value: product.value,
        deliveryFormat: product.deliveryFormat,
        solution: product.solution,
        tags: [],
      }
    })

    // Mark product as added to inventory and link it
    await prisma.product.update({
      where: { id: productId },
      data: {
        isAddedToInventory: true,
        inventoryProductId: inventoryProduct.id,
      }
    })

    revalidatePath('/inventory')
    revalidatePath(`/offer/${product.offerId}`)
    return { success: true, inventoryProduct }
  } catch (error) {
    console.error('Error adding product to inventory:', error)
    return { success: false, error: 'Failed to add product to inventory' }
  }
}
