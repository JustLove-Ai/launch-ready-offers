'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { StepOne } from '@/components/create-offer/step-one'
import { StepTwo } from '@/components/create-offer/step-two'
import { StepThree } from '@/components/create-offer/step-three'
import { StepFour } from '@/components/create-offer/step-four'
import { StepFive } from '@/components/create-offer/step-five'
import { useRouter } from 'next/navigation'

export type Problem = {
  id: string
  title: string
  description: string
  emotionalHook: string
}

export type ProductIdea = {
  id: string
  name: string
  description: string
  value: number
  deliveryFormat: string
  solution: string
  problemId?: string
  isBonus: boolean
}

export type OfferData = {
  name: string
  topic: string
  description: string
  tags: string[]
  problems: Problem[]
  productIdeas: ProductIdea[]
  selectedProducts: ProductIdea[]
  launchDate?: Date
  price: number
}

const steps = [
  { number: 1, title: 'Describe Your Offer', description: 'Tell us what you want to create' },
  { number: 2, title: 'Problems & Solutions', description: 'AI-generated problems your offer solves' },
  { number: 3, title: 'Product Ideas', description: 'AI-generated product concepts' },
  { number: 4, title: 'Select Best Fit', description: 'AI-recommended products and bonuses' },
  { number: 5, title: 'Review & Launch', description: 'Finalize your offer' },
]

export default function CreateOfferPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [offerData, setOfferData] = useState<OfferData>({
    name: '',
    topic: '',
    description: '',
    tags: [],
    problems: [],
    productIdeas: [],
    selectedProducts: [],
    price: 0,
  })

  const progress = (currentStep / steps.length) * 100

  const updateOfferData = (data: Partial<OfferData>) => {
    setOfferData(prev => ({ ...prev, ...data }))
  }

  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return offerData.name && offerData.description
      case 2:
        return offerData.problems.length > 0
      case 3:
        return offerData.productIdeas.length > 0
      case 4:
        return offerData.selectedProducts.length > 0
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Offers
            </Button>
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Create New Offer
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            AI-powered offer creation in {steps.length} simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-slate-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="mb-8 hidden md:block">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col items-center flex-1 ${
                  index !== steps.length - 1 ? 'relative' : ''
                }`}
              >
                {/* Connector Line */}
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 right-[-50%] h-0.5 ${
                      currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    currentStep > step.number
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : currentStep === step.number
                        ? 'border-purple-500 bg-purple-500 text-white'
                        : 'border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 hidden lg:block">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <StepOne
                offerData={offerData}
                updateOfferData={updateOfferData}
                isLoading={isLoading}
              />
            )}
            {currentStep === 2 && (
              <StepTwo
                offerData={offerData}
                updateOfferData={updateOfferData}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
            {currentStep === 3 && (
              <StepThree
                offerData={offerData}
                updateOfferData={updateOfferData}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
            {currentStep === 4 && (
              <StepFour
                offerData={offerData}
                updateOfferData={updateOfferData}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
            {currentStep === 5 && (
              <StepFive
                offerData={offerData}
                updateOfferData={updateOfferData}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onComplete={(offerId) => router.push(`/offer/${offerId}`)}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 1 || isLoading}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={goToNextStep}
              disabled={!canProceed() || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <div className="text-sm text-slate-600">
              Review and create your offer above
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
