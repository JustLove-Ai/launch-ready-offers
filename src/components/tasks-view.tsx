'use client'

import { useState } from 'react'
import { Offer, Product, Task, SubTask } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle2, Clock, AlertCircle, Calendar, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AddTaskDialog } from '@/components/add-task-dialog'
import { updateTask, deleteTask } from '@/actions/task-actions'
import { toggleSubTask } from '@/actions/subtask-actions'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { OfferPreviewPanel } from '@/components/offer-preview-panel'

type OfferWithRelations = Offer & {
  products: (Product & {
    tasks: (Task & {
      subtasks: SubTask[]
    })[]
  })[]
}

interface TasksViewProps {
  offer: OfferWithRelations
}

export function TasksView({ offer: initialOffer }: TasksViewProps) {
  const router = useRouter()
  const [offer, setOffer] = useState(initialOffer)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<(Task & { subtasks: SubTask[] }) | null>(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)

  const handleToggleSubtask = async (subtaskId: string) => {
    await toggleSubTask(subtaskId)
    router.refresh()
  }

  const handleUpdateTaskStatus = async (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED') => {
    await updateTask(taskId, { status })
    router.refresh()
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    const result = await deleteTask(taskId)
    if (result.success) {
      router.refresh()
    }
  }

  const allTasks = offer.products.flatMap((product) =>
    product.tasks.map((task) => ({ ...task, productName: product.name, productId: product.id }))
  )

  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED').length
  const inProgressTasks = allTasks.filter((t) => t.status === 'IN_PROGRESS').length
  const todoTasks = allTasks.filter((t) => t.status === 'TODO').length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const getStatusBadge = (status: string) => {
    const variants = {
      COMPLETED: 'default',
      IN_PROGRESS: 'secondary',
      TODO: 'outline',
    }
    return variants[status as keyof typeof variants] || 'outline'
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-6 flex-shrink-0">
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
        <Card className="mb-6 flex-shrink-0">
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

      {/* Filters and Actions */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {offer.products.length > 0 && (
          <Select
            value={selectedProductId || ''}
            onValueChange={(value) => {
              setSelectedProductId(value)
              setShowAddDialog(true)
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Add task to..." />
            </SelectTrigger>
            <SelectContent>
              {offer.products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] flex-1 overflow-hidden">
        {/* Tasks Table */}
        <Card className="flex flex-col overflow-hidden">
          <div className="p-6 pb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold text-slate-900">Launch Tasks</h2>
          </div>
          <div className="flex-1 overflow-auto px-6 pb-6">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <p className="text-sm text-slate-500">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No tasks found.'
                      : offer.products.length === 0
                        ? 'Add products first, then create tasks for each product.'
                        : 'No tasks yet. Select a product to add your first task!'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => {
                const completedSubtasks = task.subtasks.filter((st) => st.completed).length
                const totalSubtasks = task.subtasks.length
                const taskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

                return (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => {
                      setSelectedTask(task)
                      setShowTaskDetails(true)
                    }}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-slate-500 line-clamp-1">{task.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {task.productName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(task.status) as any} className="text-xs">
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {totalSubtasks > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {completedSubtasks}/{totalSubtasks}
                          </span>
                          <Progress value={taskProgress} className="h-1.5 w-16" />
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTask(task.id)
                          }}
                          className="hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
          </div>
        </Card>

        {/* Live Preview */}
        <div className="overflow-hidden">
          <OfferPreviewPanel offer={offer} />
        </div>
      </div>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>{selectedTask?.description}</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 py-4">
              {/* Status Update Buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Status:</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedTask.status === 'TODO' ? 'default' : 'outline'}
                    onClick={() => {
                      handleUpdateTaskStatus(selectedTask.id, 'TODO')
                      setShowTaskDetails(false)
                    }}
                  >
                    To Do
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedTask.status === 'IN_PROGRESS' ? 'default' : 'outline'}
                    onClick={() => {
                      handleUpdateTaskStatus(selectedTask.id, 'IN_PROGRESS')
                      setShowTaskDetails(false)
                    }}
                  >
                    In Progress
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedTask.status === 'COMPLETED' ? 'default' : 'outline'}
                    onClick={() => {
                      handleUpdateTaskStatus(selectedTask.id, 'COMPLETED')
                      setShowTaskDetails(false)
                    }}
                  >
                    Completed
                  </Button>
                </div>
              </div>

              {/* Subtasks */}
              {selectedTask.subtasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Subtasks:</p>
                  <div className="space-y-2">
                    {selectedTask.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-3">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() => {
                            handleToggleSubtask(subtask.id)
                          }}
                        />
                        <span
                          className={`text-sm ${
                            subtask.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                          }`}
                        >
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      {selectedProductId && (
        <AddTaskDialog
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open)
            if (!open) setSelectedProductId(null)
          }}
          productId={selectedProductId}
        />
      )}
    </div>
  )
}
