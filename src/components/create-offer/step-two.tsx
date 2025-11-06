'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Trash2, Plus, Edit2, Check, X } from 'lucide-react'
import { OfferData, Problem } from '@/app/offer/create/page'
import { useState } from 'react'
import { generateProblems } from '@/actions/ai-actions'

interface StepTwoProps {
  offerData: OfferData
  updateOfferData: (data: Partial<OfferData>) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function StepTwo({ offerData, updateOfferData, isLoading, setIsLoading }: StepTwoProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Problem | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const result = await generateProblems(offerData.description, offerData.topic || '')
      if (result.success && result.problems) {
        updateOfferData({ problems: result.problems })
      }
    } catch (error) {
      console.error('Error generating problems:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (problem: Problem) => {
    setEditingId(problem.id)
    setEditForm({ ...problem })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const saveEditing = () => {
    if (editForm) {
      updateOfferData({
        problems: offerData.problems.map(p => p.id === editForm.id ? editForm : p)
      })
      cancelEditing()
    }
  }

  const removeProblem = (id: string) => {
    updateOfferData({
      problems: offerData.problems.filter(p => p.id !== id)
    })
  }

  const addNewProblem = () => {
    const newProblem: Problem = {
      id: `problem-${Date.now()}`,
      title: '',
      description: '',
      emotionalHook: ''
    }
    updateOfferData({
      problems: [...offerData.problems, newProblem]
    })
    startEditing(newProblem)
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          Use AI to generate problems based on your description, or add problems manually.
        </AlertDescription>
      </Alert>

      {/* Action Buttons - Always Visible */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {offerData.problems.length === 0 ? 'Add Problems' : `Problems (${offerData.problems.length})`}
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={addNewProblem}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Manually
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            size="sm"
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            <Sparkles className="h-4 w-4" />
            {isLoading ? 'Generating...' : offerData.problems.length === 0 ? 'Generate with AI' : 'Regenerate'}
          </Button>
        </div>
      </div>

      {/* Problems List or Empty State */}
      {offerData.problems.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-slate-500">
            <p className="mb-4">No problems added yet.</p>
            <p className="text-sm">Click "Add Manually" to create your own, or use "Generate with AI" to get started.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {offerData.problems.map((problem, index) => (
            <Card key={problem.id} className="p-4">
              {editingId === problem.id && editForm ? (
                <div className="space-y-4">
                  <div>
                    <Label>Problem Title *</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="e.g., Struggling to grow social media following"
                    />
                  </div>
                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Describe the problem in detail..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Emotional Hook</Label>
                    <Input
                      value={editForm.emotionalHook}
                      onChange={(e) => setEditForm({ ...editForm, emotionalHook: e.target.value })}
                      placeholder="Why this problem hurts (e.g., Feeling invisible despite hard work)"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveEditing} size="sm" className="gap-2">
                      <Check className="h-4 w-4" />
                      Save
                    </Button>
                    <Button onClick={cancelEditing} variant="outline" size="sm" className="gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-semibold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{problem.title}</h4>
                        <p className="text-slate-600 mb-2">{problem.description}</p>
                        {problem.emotionalHook && (
                          <p className="text-sm text-purple-600 italic">
                            💔 {problem.emotionalHook}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEditing(problem)}
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => removeProblem(problem.id)}
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
