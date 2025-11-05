'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createSubTask(data: {
  taskId: string
  title: string
}) {
  try {
    // Get the highest order number for this task
    const lastSubTask = await prisma.subTask.findFirst({
      where: { taskId: data.taskId },
      orderBy: { order: 'desc' },
    })

    const subtask = await prisma.subTask.create({
      data: {
        title: data.title,
        taskId: data.taskId,
        order: (lastSubTask?.order || 0) + 1,
        completed: false,
      },
      include: {
        task: {
          include: {
            product: {
              select: {
                offerId: true,
              },
            },
          },
        },
      },
    })

    revalidatePath(`/offer/${subtask.task.product.offerId}`)
    return { success: true, subtask }
  } catch (error) {
    console.error('Error creating subtask:', error)
    return { success: false, error: 'Failed to create subtask' }
  }
}

export async function updateSubTask(
  id: string,
  data: {
    title?: string
    completed?: boolean
    order?: number
  }
) {
  try {
    const subtask = await prisma.subTask.update({
      where: { id },
      data,
      include: {
        task: {
          include: {
            product: {
              select: {
                offerId: true,
              },
            },
          },
        },
      },
    })

    revalidatePath(`/offer/${subtask.task.product.offerId}`)
    return { success: true, subtask }
  } catch (error) {
    console.error('Error updating subtask:', error)
    return { success: false, error: 'Failed to update subtask' }
  }
}

export async function deleteSubTask(id: string) {
  try {
    const subtask = await prisma.subTask.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            product: {
              select: {
                offerId: true,
              },
            },
          },
        },
      },
    })

    if (!subtask) {
      return { success: false, error: 'Subtask not found' }
    }

    await prisma.subTask.delete({
      where: { id },
    })

    revalidatePath(`/offer/${subtask.task.product.offerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting subtask:', error)
    return { success: false, error: 'Failed to delete subtask' }
  }
}

export async function toggleSubTask(id: string) {
  try {
    const subtask = await prisma.subTask.findUnique({
      where: { id },
    })

    if (!subtask) {
      return { success: false, error: 'Subtask not found' }
    }

    const updated = await updateSubTask(id, {
      completed: !subtask.completed,
    })

    return updated
  } catch (error) {
    console.error('Error toggling subtask:', error)
    return { success: false, error: 'Failed to toggle subtask' }
  }
}

export async function reorderSubTasks(taskId: string, subtaskIds: string[]) {
  try {
    // Update each subtask with its new order
    await Promise.all(
      subtaskIds.map((subtaskId, index) =>
        prisma.subTask.update({
          where: { id: subtaskId },
          data: { order: index },
        })
      )
    )

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        product: {
          select: {
            offerId: true,
          },
        },
      },
    })

    if (task) {
      revalidatePath(`/offer/${task.product.offerId}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error reordering subtasks:', error)
    return { success: false, error: 'Failed to reorder subtasks' }
  }
}
