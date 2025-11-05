'use client'

import { useState } from 'react'
import { Offer, Problem, Product } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Sparkles, Trash2, Package } from 'lucide-react'
import { createProblem, deleteProblem, updateProblem } from '@/actions/problem-actions'
import { generateProblemSuggestions } from '@/actions/ai-actions'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

type ProblemWithProducts = Problem & {
  products: Product[]
}

type OfferWithProblems = Offer & {
  problems: ProblemWithProducts[]
}

interface ProblemsTabProps {
  offer: OfferWithProblems
}

export function ProblemsTab({ offer }: ProblemsTabProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emotionalHook: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createProblem({
        offerId: offer.id,
        title: formData.title,
        description: formData.description || undefined,
        emotionalHook: formData.emotionalHook || undefined,
      })

      if (result.success) {
        setFormData({ title: '', description: '', emotionalHook: '' })
        setShowForm(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Error creating problem:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateProblems = async () => {
    if (!offer.topic) {
      alert('Please add a description to your offer first')
      return
    }

    setLoading(true)
    try {
      const result = await generateProblemSuggestions(offer.topic)
      if (result.success && result.problems) {
        // Create problems from AI suggestions
        await Promise.all(
          result.problems.map((p: any) =>
            createProblem({
              offerId: offer.id,
              title: p.problem,
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

  const handleDelete = async (problemId: string) => {
    if (!confirm('Delete this problem?')) return

    await deleteProblem(problemId)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Problems & Solutions</h2>
          <p className="text-sm text-slate-600">
            Define problems your audience faces, then create products that solve them
          </p>
        </div>
        <div className="flex gap-2">
          {offer.topic && (
            <Button
              onClick={handleGenerateProblems}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Generate
            </Button>
          )}
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Problem
          </Button>
        </div>
      </div>

      {/* Add Problem Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Problem *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Spending hours creating social media content"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="More details about this problem..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emotionalHook">Why It Hurts (Emotional Hook)</Label>
                <Input
                  id="emotionalHook"
                  placeholder="e.g., Stealing time from actually growing your business"
                  value={formData.emotionalHook}
                  onChange={(e) => setFormData({ ...formData, emotionalHook: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !formData.title}>
                  Create Problem
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Problems List */}
      <div className="grid gap-4 md:grid-cols-2">
        {offer.problems.map((problem) => (
          <Card key={problem.id} className="group relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{problem.title}</CardTitle>
                  {problem.emotionalHook && (
                    <p className="mt-1 text-sm italic text-slate-600">"{problem.emotionalHook}"</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleDelete(problem.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {problem.description && (
                <p className="mb-3 text-sm text-slate-600">{problem.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Package className="h-4 w-4" />
                <span>
                  {problem.products.length} solution
                  {problem.products.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {offer.problems.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">
              No problems defined yet. Add your first problem or generate suggestions with AI.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
