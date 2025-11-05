'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, ChevronRight, ArrowLeft } from 'lucide-react'
import { generateProblemSuggestions, generateSolutionForProblem } from '@/actions/ai-actions'
import { createProduct } from '@/actions/product-actions'
import { Offer } from '@prisma/client'

interface AISuggestionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer: Offer
  onSuccess?: (data: any) => void
}

type Problem = {
  problem: string
  emotionalHook: string
}

type Solution = {
  name: string
  description: string
  transformation: string
  suggestedValue: number
  benefits: string[]
}

export function AISuggestionsDialog({ open, onOpenChange, offer, onSuccess }: AISuggestionsDialogProps) {
  const router = useRouter()
  const [step, setStep] = useState<'problems' | 'solutions'>('problems')
  const [loading, setLoading] = useState(false)
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [solutions, setSolutions] = useState<Solution[]>([])

  const handleGenerateProblems = async () => {
    if (!offer.topic) {
      alert('Please add a topic to your offer first')
      return
    }

    setLoading(true)
    try {
      const result = await generateProblemSuggestions(offer.topic)
      if (result.success && result.problems) {
        setProblems(result.problems)
      }
    } catch (error) {
      console.error('Error generating problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProblem = async (problem: Problem) => {
    setSelectedProblem(problem)
    setLoading(true)
    setStep('solutions')

    try {
      const result = await generateSolutionForProblem(problem.problem, offer.topic || '')
      if (result.success && result.solutions) {
        setSolutions(result.solutions)
      }
    } catch (error) {
      console.error('Error generating solutions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (solution: Solution, isBonus: boolean = false) => {
    setLoading(true)
    try {
      const result = await createProduct({
        offerId: offer.id,
        name: solution.name,
        description: solution.description,
        value: solution.suggestedValue,
        isBonus,
        problem: selectedProblem?.problem,
        solution: solution.transformation,
      })

      if (result.success) {
        router.refresh()
        // Don't close dialog, let user add more products
      }
    } catch (error) {
      console.error('Error adding product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('problems')
    setProblems([])
    setSelectedProblem(null)
    setSolutions([])
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) handleReset()
    }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI-Powered Offer Builder
          </DialogTitle>
          <DialogDescription>
            {step === 'problems'
              ? 'Select a problem your audience faces'
              : 'Choose solutions to add to your offer'}
          </DialogDescription>
        </DialogHeader>

        {step === 'problems' && (
          <div className="space-y-4 py-4">
            {problems.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  Generate Problem Suggestions
                </h3>
                <p className="mb-6 max-w-md text-center text-sm text-slate-600">
                  AI will analyze your topic "{offer.topic}" and suggest specific problems your
                  audience faces
                </p>
                <Button
                  onClick={handleGenerateProblems}
                  disabled={loading}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Problems
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {problems.map((problem, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
                    onClick={() => handleSelectProblem(problem)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-start justify-between text-base">
                        <span className="flex-1">{problem.problem}</span>
                        <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-400" />
                      </CardTitle>
                      <CardDescription className="text-xs italic">
                        "{problem.emotionalHook}"
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'solutions' && (
          <div className="space-y-4 py-4">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to problems
            </Button>

            {selectedProblem && (
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium text-purple-900">
                    Problem: {selectedProblem.problem}
                  </p>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <Card key={index} className="border-slate-200">
                    <CardHeader>
                      <div className="mb-2 flex items-start justify-between">
                        <CardTitle className="text-lg">{solution.name}</CardTitle>
                        <Badge variant="secondary" className="text-lg">
                          ${solution.suggestedValue}
                        </Badge>
                      </div>
                      <CardDescription>{solution.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="rounded-lg bg-emerald-50 p-3">
                        <p className="text-sm font-medium text-emerald-900">
                          {solution.transformation}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-700">Key Benefits:</p>
                        {solution.benefits.map((benefit, i) => (
                          <p key={i} className="text-xs text-slate-600">
                            • {benefit}
                          </p>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAddProduct(solution, false)}
                          disabled={loading}
                          className="flex-1"
                        >
                          Add as Product
                        </Button>
                        <Button
                          onClick={() => handleAddProduct(solution, true)}
                          disabled={loading}
                          variant="outline"
                          className="flex-1"
                        >
                          Add as Bonus
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
