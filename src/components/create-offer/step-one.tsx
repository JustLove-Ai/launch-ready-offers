'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { OfferData } from '@/app/offer/create/page'
import { format } from 'date-fns'

interface StepOneProps {
  offerData: OfferData
  updateOfferData: (data: Partial<OfferData>) => void
  isLoading: boolean
}

export function StepOne({ offerData, updateOfferData, isLoading }: StepOneProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="description" className="text-base">
          What do you want to create? *
        </Label>
        <p className="text-sm text-slate-500 mb-2">
          Describe your offer idea. Be specific about your target audience and what problem you're solving.
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
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="price" className="text-base">
            Your Price *
          </Label>
          <p className="text-sm text-slate-500 mb-2">
            What will you charge for this offer?
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <Input
              id="price"
              type="number"
              value={offerData.price || ''}
              onChange={(e) => updateOfferData({ price: parseFloat(e.target.value) || 0 })}
              className="pl-7 text-base"
              placeholder="97"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label className="text-base">Launch Date (Optional)</Label>
          <p className="text-sm text-slate-500 mb-2">
            When do you plan to launch?
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {offerData.launchDate ? (
                  format(offerData.launchDate, 'PPP')
                ) : (
                  <span className="text-slate-500">Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={offerData.launchDate}
                onSelect={(date) => updateOfferData({ launchDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
