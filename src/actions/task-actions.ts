'use server'

import { prisma } from '@/lib/prisma'
import { TaskStatus, TaskPriority } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createTask(data: {
  productId: string
  title: string
  description?: string
  dueDate?: Date
  priority?: TaskPriority
}) {
  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority || TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        productId: data.productId,
      },
      include: {
        subtasks: {
          orderBy: { order: 'asc' },
        },
        product: {
          select: {
            offerId: true,
          },
        },
      },
    })

    revalidatePath(`/offer/${task.product.offerId}`)
    return { success: true, task }
  } catch (error) {
    console.error('Error creating task:', error)
    return { success: false, error: 'Failed to create task' }
  }
}

export async function updateTask(
  id: string,
  data: {
    title?: string
    description?: string
    dueDate?: Date
    status?: TaskStatus
    priority?: TaskPriority
  }
) {
  try {
    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        subtasks: {
          orderBy: { order: 'asc' },
        },
        product: {
          select: {
            offerId: true,
          },
        },
      },
    })

    revalidatePath(`/offer/${task.product.offerId}`)
    return { success: true, task }
  } catch (error) {
    console.error('Error updating task:', error)
    return { success: false, error: 'Failed to update task' }
  }
}

export async function deleteTask(id: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            offerId: true,
          },
        },
      },
    })

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    await prisma.task.delete({
      where: { id },
    })

    revalidatePath(`/offer/${task.product.offerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting task:', error)
    return { success: false, error: 'Failed to delete task' }
  }
}

export async function getTasksByProduct(productId: string) {
  try {
    const tasks = await prisma.task.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        subtasks: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return { success: true, tasks }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return { success: false, error: 'Failed to fetch tasks' }
  }
}

export async function getTaskStats(productId: string) {
  try {
    const tasks = await prisma.task.findMany({
      where: { productId },
      include: {
        subtasks: true,
      },
    })

    const total = tasks.length
    const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length
    const inProgress = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
    const todo = tasks.filter((t) => t.status === TaskStatus.TODO).length

    const totalSubtasks = tasks.reduce((sum, task) => sum + task.subtasks.length, 0)
    const completedSubtasks = tasks.reduce(
      (sum, task) => sum + task.subtasks.filter((st) => st.completed).length,
      0
    )

    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      success: true,
      stats: {
        total,
        completed,
        inProgress,
        todo,
        totalSubtasks,
        completedSubtasks,
        progressPercentage,
      },
    }
  } catch (error) {
    console.error('Error calculating task stats:', error)
    return { success: false, error: 'Failed to calculate stats' }
  }
}
