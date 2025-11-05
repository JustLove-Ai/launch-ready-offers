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

export async function createFullOffer(data: {
  name: string
  topic?: string
  description?: string
  tags: string[]
  price: number
  totalValue: number
  launchDate?: Date
  problems: Array<{
    id: string
    title: string
    description: string
    emotionalHook: string
  }>
  products: Array<{
    id: string
    name: string
    description: string
    value: number
    deliveryFormat: string
    solution: string
    problemId?: string
    isBonus: boolean
  }>
}) {
  try {
    // Create a map of temporary problem IDs to their database problems
    const problemIdMap = new Map<string, string>()

    const offer = await prisma.offer.create({
      data: {
        name: data.name,
        topic: data.topic,
        description: data.description,
        tags: data.tags,
        price: data.price,
        totalValue: data.totalValue,
        launchDate: data.launchDate,
        status: OfferStatus.DRAFT,
        problems: {
          create: data.problems.map(problem => ({
            title: problem.title,
            description: problem.description,
            emotionalHook: problem.emotionalHook,
          }))
        }
      },
      include: {
        problems: true,
      }
    })

    // Map temporary problem IDs to real database IDs
    data.problems.forEach((tempProblem, index) => {
      problemIdMap.set(tempProblem.id, offer.problems[index].id)
    })

    // Create products with correct problem references
    await Promise.all(
      data.products.map((product, index) =>
        prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            value: product.value,
            deliveryFormat: product.deliveryFormat,
            solution: product.solution,
            isBonus: product.isBonus,
            order: index,
            offerId: offer.id,
            problemId: product.problemId ? problemIdMap.get(product.problemId) : undefined,
          }
        })
      )
    )

    revalidatePath('/')
    return { success: true, offer }
  } catch (error) {
    console.error('Error creating full offer:', error)
    return { success: false, error: 'Failed to create offer' }
  }
}
