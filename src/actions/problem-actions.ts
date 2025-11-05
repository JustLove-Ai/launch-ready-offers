'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createProblem(data: {
  offerId: string
  title: string
  description?: string
  emotionalHook?: string
}) {
  try {
    const problem = await prisma.problem.create({
      data: {
        title: data.title,
        description: data.description,
        emotionalHook: data.emotionalHook,
        offerId: data.offerId,
      },
      include: {
        products: true,
      },
    })

    revalidatePath(`/offer/${data.offerId}`)
    return { success: true, problem }
  } catch (error) {
    console.error('Error creating problem:', error)
    return { success: false, error: 'Failed to create problem' }
  }
}

export async function updateProblem(
  id: string,
  data: {
    title?: string
    description?: string
    emotionalHook?: string
  }
) {
  try {
    const problem = await prisma.problem.update({
      where: { id },
      data,
      include: {
        products: true,
        offer: {
          select: {
            id: true,
          },
        },
      },
    })

    revalidatePath(`/offer/${problem.offer.id}`)
    return { success: true, problem }
  } catch (error) {
    console.error('Error updating problem:', error)
    return { success: false, error: 'Failed to update problem' }
  }
}

export async function deleteProblem(id: string) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id },
      select: {
        offerId: true,
      },
    })

    if (!problem) {
      return { success: false, error: 'Problem not found' }
    }

    await prisma.problem.delete({
      where: { id },
    })

    revalidatePath(`/offer/${problem.offerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting problem:', error)
    return { success: false, error: 'Failed to delete problem' }
  }
}

export async function getProblemsByOffer(offerId: string) {
  try {
    const problems = await prisma.problem.findMany({
      where: { offerId },
      include: {
        products: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, problems }
  } catch (error) {
    console.error('Error fetching problems:', error)
    return { success: false, error: 'Failed to fetch problems' }
  }
}
