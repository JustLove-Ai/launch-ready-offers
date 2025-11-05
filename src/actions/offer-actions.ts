'use server'

import { prisma } from '@/lib/prisma'
import { OfferStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createOffer(data: {
  name: string
  topic?: string
  description?: string
  launchDate?: Date
  price?: number
}) {
  try {
    const offer = await prisma.offer.create({
      data: {
        name: data.name,
        topic: data.topic,
        description: data.description,
        launchDate: data.launchDate,
        price: data.price || 0,
        status: OfferStatus.DRAFT,
      },
      include: {
        products: {
          include: {
            tasks: {
              include: {
                subtasks: true,
              },
            },
          },
        },
      },
    })
    revalidatePath('/')
    return { success: true, offer }
  } catch (error) {
    console.error('Error creating offer:', error)
    return { success: false, error: 'Failed to create offer' }
  }
}

export async function getOffers() {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          include: {
            tasks: {
              include: {
                subtasks: true,
              },
            },
          },
        },
      },
    })
    return { success: true, offers }
  } catch (error) {
    console.error('Error fetching offers:', error)
    return { success: false, error: 'Failed to fetch offers' }
  }
}

export async function getOfferById(id: string) {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { createdAt: 'desc' },
              include: {
                subtasks: {
                  orderBy: { order: 'asc' },
                },
              },
            },
            problem: true,
          },
        },
        problems: {
          orderBy: { createdAt: 'desc' },
          include: {
            products: true,
          },
        },
      },
    })
    if (!offer) {
      return { success: false, error: 'Offer not found' }
    }
    return { success: true, offer }
  } catch (error) {
    console.error('Error fetching offer:', error)
    return { success: false, error: 'Failed to fetch offer' }
  }
}

export async function updateOffer(
  id: string,
  data: {
    name?: string
    topic?: string
    description?: string
    launchDate?: Date
    status?: OfferStatus
    price?: number
    totalValue?: number
  }
) {
  try {
    const offer = await prisma.offer.update({
      where: { id },
      data,
      include: {
        products: {
          include: {
            tasks: {
              include: {
                subtasks: true,
              },
            },
          },
        },
      },
    })
    revalidatePath(`/offer/${id}`)
    revalidatePath('/')
    return { success: true, offer }
  } catch (error) {
    console.error('Error updating offer:', error)
    return { success: false, error: 'Failed to update offer' }
  }
}

export async function deleteOffer(id: string) {
  try {
    await prisma.offer.delete({
      where: { id },
    })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting offer:', error)
    return { success: false, error: 'Failed to delete offer' }
  }
}

export async function calculateOfferTotals(offerId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { offerId },
    })
    const totalValue = products.reduce((sum, product) => sum + product.value, 0)

    const offer = await prisma.offer.update({
      where: { id: offerId },
      data: { totalValue },
    })

    revalidatePath(`/offer/${offerId}`)
    return { success: true, totalValue }
  } catch (error) {
    console.error('Error calculating offer totals:', error)
    return { success: false, error: 'Failed to calculate totals' }
  }
}
