'use client'

import { useState } from 'react'
import { Offer, Problem, Product } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles, Pencil, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createProblem, deleteProblem, updateProblem } from '@/actions/problem-actions'
import { generateProblemSuggestions } from '@/actions/ai-actions'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { OfferPreviewPanel } from '@/components/offer-preview-panel'

type ProblemWithProducts = Problem & {
  products: Product[]
}

interface ProblemsViewProps {
  offer: Offer
  initialProblems: ProblemWithProducts[]
}

export function ProblemsView({ offer, initialProblems }: ProblemsViewProps) {
  const router = useRouter()
  const [problems, setProblems] = useState(initialProblems)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emotionalHook: '',
  })

  const handleGenerateProblems = async () => {
    setLoading(true)
    try {
      const result = await generateProblemSuggestions(offer.topic || offer.name)
      if (result.success && result.problems) {
        const createdProblems = await Promise.all(
          result.problems.map((p: any) =>
            createProblem({
              offerId: offer.id,
              title: p.problem,
              description: p.problem,
              emotionalHook: p.emotionalHook,
            })
          )
        )
        router.refresh()
      }
    } catch (error) {
      console.error('Error generating problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    setLoading(true)
    try {
      const result = await createProblem({
        offerId: offer.id,
        title: formData.title,
        description: formData.description,
        emotionalHook: formData.emotionalHook,
      })
      if (result.success && result.problem) {
        setProblems([...problems, { ...result.problem, products: [] }])
        setShowAddDialog(false)
        setFormData({ title: '', description: '', emotionalHook: '' })
      }
    } catch (error) {
      console.error('Error creating problem:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (problem: Problem) => {
    setEditingProblem(problem)
    setFormData({
      title: problem.title,
      description: problem.description || '',
      emotionalHook: problem.emotionalHook || '',
    })
    setShowEditDialog(true)
  }

  const handleUpdate = async () => {
    if (!editingProblem) return
    setLoading(true)
    try {
      const result = await updateProblem(editingProblem.id, {
        title: formData.title,
        description: formData.description,
        emotionalHook: formData.emotionalHook,
      })
      if (result.success && result.problem) {
        setProblems(
          problems.map((p) =>
            p.id === editingProblem.id ? { ...result.problem, products: p.products } : p
          )
        )
        setShowEditDialog(false)
        setEditingProblem(null)
        setFormData({ title: '', description: '', emotionalHook: '' })
      }
    } catch (error) {
      console.error('Error updating problem:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this problem?')) return
    const result = await deleteProblem(problemId)
    if (result.success) {
      setProblems(problems.filter((p) => p.id !== problemId))
    }
  }

  const filteredProblems = problems.filter((problem) =>
    problem.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div className="flex-1">
          <Input
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateProblems}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:scale-[1.02]"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            AI Generate
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Problem
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_800px] flex-1 overflow-hidden">
        {/* Problems Table */}
        <Card className="flex flex-col overflow-hidden">
          <div className="p-6 pb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold text-slate-900">Problems & Solutions</h2>
          </div>
          <div className="flex-1 overflow-auto px-6 pb-6">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Problem</TableHead>
              <TableHead>Emotional Hook</TableHead>
              <TableHead>Solutions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProblems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <p className="text-sm text-slate-500">
                    {searchQuery ? 'No problems found.' : 'No problems yet. Add your first problem or use AI to generate!'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredProblems.map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{problem.title}</p>
                      {problem.description && (
                        <p className="text-sm text-slate-500 line-clamp-2">{problem.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {problem.emotionalHook ? (
                      <p className="text-sm italic text-slate-600">{problem.emotionalHook}</p>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {problem.products?.length || 0} solution{problem.products?.length !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(problem)}
                        className="hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(problem.id)}
                        className="hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Problem</DialogTitle>
            <DialogDescription>Define a problem your audience faces</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Problem *</Label>
              <Input
                id="title"
                placeholder="What problem does your audience face?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emotionalHook">Emotional Hook</Label>
              <Input
                id="emotionalHook"
                placeholder="Why does this problem hurt?"
                value={formData.emotionalHook}
                onChange={(e) => setFormData({ ...formData, emotionalHook: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={loading || !formData.title}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Problem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Problem</DialogTitle>
            <DialogDescription>Update the problem details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Problem *</Label>
              <Input
                id="edit-title"
                placeholder="What problem does your audience face?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Detailed description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emotionalHook">Emotional Hook</Label>
              <Input
                id="edit-emotionalHook"
                placeholder="Why does this problem hurt?"
                value={formData.emotionalHook}
                onChange={(e) => setFormData({ ...formData, emotionalHook: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading || !formData.title}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update Problem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
