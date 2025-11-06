'use client'

import { useState, useEffect } from 'react'
import { Offer, Product } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { OfferPreviewCustomizable } from '@/components/offer-preview-customizable'
import { OfferCustomizationSettings } from '@/components/offer-customization-settings'
import { Button } from '@/components/ui/button'
import { Save, Loader2, CheckCircle } from 'lucide-react'
import { getCustomizationFromOffer, customizationToDbFormat } from '@/lib/customization-utils'
import { updateOfferCustomization } from '@/actions/offer-actions'
import { OfferCustomization } from '@/types/customization'
import { useRouter } from 'next/navigation'

type OfferWithProducts = Offer & {
  products: Product[]
}

interface CustomizationViewProps {
  offer: OfferWithProducts
}

export function CustomizationView({ offer: initialOffer }: CustomizationViewProps) {
  const router = useRouter()
  const [offer, setOffer] = useState(initialOffer)
  const [customization, setCustomization] = useState<OfferCustomization>(() =>
    getCustomizationFromOffer(initialOffer)
  )
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSavedMessage, setShowSavedMessage] = useState(false)

  // Update customization when offer changes
  useEffect(() => {
    const newCustomization = getCustomizationFromOffer(initialOffer)
    setCustomization(newCustomization)
    setOffer(initialOffer)
    setHasUnsavedChanges(false)
  }, [initialOffer.id, initialOffer.template, initialOffer.themeName])

  const handleCustomizationChange = (newCustomization: OfferCustomization) => {
    setCustomization(newCustomization)
    setHasUnsavedChanges(true)
    setShowSavedMessage(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const dbFormat = customizationToDbFormat(customization)
      const result = await updateOfferCustomization(offer.id, dbFormat)
      if (result.success) {
        setHasUnsavedChanges(false)
        setShowSavedMessage(true)
        router.refresh()

        // Hide saved message after 3 seconds
        setTimeout(() => {
          setShowSavedMessage(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Error saving customization:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Save Button Bar */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Customize Your Offer</h2>
          <p className="text-sm text-slate-600 mt-1">
            Choose a template and colors - see changes in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showSavedMessage && (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Saved!</span>
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            size="lg"
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] flex-1 overflow-hidden">
        {/* Settings Panel */}
        <div className="overflow-hidden">
          <OfferCustomizationSettings
            customization={customization}
            onCustomizationChange={handleCustomizationChange}
          />
        </div>

        {/* Live Preview */}
        <Card className="flex flex-col overflow-hidden">
          <div className="p-6 pb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold text-slate-900">Live Preview</h2>
            {hasUnsavedChanges && (
              <p className="text-xs text-amber-600 mt-1">
                Unsaved changes - click Save to apply
              </p>
            )}
          </div>
          <div className="flex-1 overflow-auto px-6 pb-6">
            <OfferPreviewCustomizable offer={offer} customization={customization} />
          </div>
        </Card>
      </div>
    </div>
  )
}
