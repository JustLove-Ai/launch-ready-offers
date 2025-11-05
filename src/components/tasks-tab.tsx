'use client'

import { Offer, Product, Task, SubTask } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { AddTaskDialog } from '@/components/add-task-dialog'
import { updateTask } from '@/actions/task-actions'
import { toggleSubTask } from '@/actions/subtask-actions'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

type OfferWithRelations = Offer & {
  products: (Product & {
    tasks: (Task & {
      subtasks: SubTask[]
    })[]
  })[]
}

interface TasksTabProps {
  offer: OfferWithRelations
  onUpdate: (offer: OfferWithRelations) => void
}

export function TasksTab({ offer, onUpdate }: TasksTabProps) {
  const router = useRouter()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const handleToggleSubtask = async (subtaskId: string) => {
    await toggleSubTask(subtaskId)
    router.refresh()
  }

  const handleUpdateTaskStatus = async (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED') => {
    await updateTask(taskId, { status })
    router.refresh()
  }

  const allTasks = offer.products.flatMap((p) => p.tasks)
  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED').length
  const inProgressTasks = allTasks.filter((t) => t.status === 'IN_PROGRESS').length
  const todoTasks = allTasks.filter((t) => t.status === 'TODO').length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{completedTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-600">
              <Clock className="h-4 w-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{inProgressTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <AlertCircle className="h-4 w-4" />
              To Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-600">{todoTasks}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">Overall Progress</span>
                <span className="text-slate-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks by Product */}
      <div className="space-y-4">
        {offer.products.map((product) => {
          const productTasks = product.tasks
          const productProgress = productTasks.length > 0
            ? (productTasks.filter((t) => t.status === 'COMPLETED').length / productTasks.length) * 100
            : 0

          return (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{product.name}</CardTitle>
                      {product.isBonus && (
                        <Badge variant="secondary" className="text-xs">
                          BONUS
                        </Badge>
                      )}
                    </div>
                    {productTasks.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            {productTasks.filter((t) => t.status === 'COMPLETED').length} of{' '}
                            {productTasks.length} tasks complete
                          </span>
                          <span className="font-medium text-slate-900">
                            {Math.round(productProgress)}%
                          </span>
                        </div>
                        <Progress value={productProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedProductId(product.id)
                      setShowAddDialog(true)
                    }}
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              {productTasks.length > 0 && (
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {productTasks.map((task) => {
                      const completedSubtasks = task.subtasks.filter((st) => st.completed).length
                      const totalSubtasks = task.subtasks.length

                      return (
                        <AccordionItem key={task.id} value={task.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex flex-1 items-center justify-between pr-4">
                              <div className="flex items-center gap-3">
                                <Badge
                                  variant={
                                    task.status === 'COMPLETED'
                                      ? 'default'
                                      : task.status === 'IN_PROGRESS'
                                        ? 'secondary'
                                        : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {task.status.replace('_', ' ')}
                                </Badge>
                                <span className="text-left font-medium">{task.title}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                {task.dueDate && (
                                  <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Calendar className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                                  </div>
                                )}
                                {totalSubtasks > 0 && (
                                  <span className="text-xs text-slate-500">
                                    {completedSubtasks}/{totalSubtasks}
                                  </span>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pl-4 pt-2">
                              {task.description && (
                                <p className="text-sm text-slate-600">{task.description}</p>
                              )}

                              {/* Status Update Buttons */}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={task.status === 'TODO' ? 'default' : 'outline'}
                                  onClick={() => handleUpdateTaskStatus(task.id, 'TODO')}
                                >
                                  To Do
                                </Button>
                                <Button
                                  size="sm"
                                  variant={task.status === 'IN_PROGRESS' ? 'default' : 'outline'}
                                  onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                                >
                                  In Progress
                                </Button>
                                <Button
                                  size="sm"
                                  variant={task.status === 'COMPLETED' ? 'default' : 'outline'}
                                  onClick={() => handleUpdateTaskStatus(task.id, 'COMPLETED')}
                                >
                                  Completed
                                </Button>
                              </div>

                              {/* Subtasks */}
                              {totalSubtasks > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-slate-700">Subtasks:</p>
                                  {task.subtasks.map((subtask) => (
                                    <div key={subtask.id} className="flex items-center gap-3">
                                      <Checkbox
                                        checked={subtask.completed}
                                        onCheckedChange={() => handleToggleSubtask(subtask.id)}
                                      />
                                      <span
                                        className={`text-sm ${
                                          subtask.completed
                                            ? 'text-slate-400 line-through'
                                            : 'text-slate-900'
                                        }`}
                                      >
                                        {subtask.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                </CardContent>
              )}
              {productTasks.length === 0 && (
                <CardContent>
                  <p className="text-sm text-slate-500">No tasks yet. Add your first task to get started!</p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {offer.products.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">Add products first, then create tasks for each product</p>
          </CardContent>
        </Card>
      )}

      {/* Add Task Dialog */}
      {selectedProductId && (
        <AddTaskDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          productId={selectedProductId}
        />
      )}
    </div>
  )
}
