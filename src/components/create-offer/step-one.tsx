'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { OfferData } from '@/app/offer/create/page'
import { useState, KeyboardEvent } from 'react'

interface StepOneProps {
  offerData: OfferData
  updateOfferData: (data: Partial<OfferData>) => void
  isLoading: boolean
}

export function StepOne({ offerData, updateOfferData, isLoading }: StepOneProps) {
  const [tagInput, setTagInput] = useState('')

  const addTag = () => {
    if (tagInput.trim() && !offerData.tags.includes(tagInput.trim())) {
      updateOfferData({
        tags: [...offerData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateOfferData({
      tags: offerData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-base">
          Offer Name *
        </Label>
        <p className="text-sm text-slate-500 mb-2">
          What would you like to call this offer?
        </p>
        <Input
          id="name"
          placeholder="e.g., Ultimate Social Media Growth Bundle"
          value={offerData.name}
          onChange={(e) => updateOfferData({ name: e.target.value })}
          disabled={isLoading}
          className="text-base"
        />
      </div>

      <div>
        <Label htmlFor="topic" className="text-base">
          Topic / Niche
        </Label>
        <p className="text-sm text-slate-500 mb-2">
          What market or niche does this offer serve?
        </p>
        <Input
          id="topic"
          placeholder="e.g., Social Media Marketing for Small Businesses"
          value={offerData.topic}
          onChange={(e) => updateOfferData({ topic: e.target.value })}
          disabled={isLoading}
          className="text-base"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-base">
          Description *
        </Label>
        <p className="text-sm text-slate-500 mb-2">
          Describe what you want to create. Be specific about your target audience and the main outcome they should achieve.
        </p>
        <Textarea
          id="description"
          placeholder="I want to create an offer for small business owners who struggle to grow their social media presence. They need help understanding algorithms, creating engaging content, and converting followers into customers..."
          value={offerData.description}
          onChange={(e) => updateOfferData({ description: e.target.value })}
          disabled={isLoading}
          rows={8}
          className="text-base resize-none"
        />
        <p className="text-sm text-slate-500 mt-2">
          Tip: The more detail you provide, the better AI can generate relevant problems and product ideas
        </p>
      </div>

      <div>
        <Label htmlFor="tags" className="text-base">
          Tags
        </Label>
        <p className="text-sm text-slate-500 mb-2">
          Add tags to help organize and filter your offers
        </p>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="e.g., marketing, social media, small business"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            disabled={isLoading}
          />
        </div>
        {offerData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {offerData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-600"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
