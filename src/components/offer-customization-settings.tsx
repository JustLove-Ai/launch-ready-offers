'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Palette, Layout, RefreshCw, Type } from 'lucide-react'
import {
  OfferCustomization,
  ColorTheme,
  CustomText,
  COLOR_THEMES,
  DEFAULT_CUSTOMIZATION,
  DEFAULT_TEXT,
  TEMPLATE_DESCRIPTIONS,
  TemplateType
} from '@/types/customization'

interface OfferCustomizationSettingsProps {
  customization: OfferCustomization
  onCustomizationChange: (customization: OfferCustomization) => void
}

export function OfferCustomizationSettings({
  customization,
  onCustomizationChange
}: OfferCustomizationSettingsProps) {
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    // Find which theme matches current colors
    const themeEntry = Object.entries(COLOR_THEMES).find(([_, theme]) =>
      theme.primary === customization.colorTheme.primary &&
      theme.secondary === customization.colorTheme.secondary
    )
    return themeEntry ? themeEntry[0] : 'custom'
  })

  const handleTemplateChange = (template: TemplateType) => {
    onCustomizationChange({
      ...customization,
      template
    })
  }

  const handleThemeChange = (themeKey: string) => {
    setActiveTheme(themeKey)
    if (themeKey !== 'custom') {
      onCustomizationChange({
        ...customization,
        colorTheme: COLOR_THEMES[themeKey],
        customColors: undefined
      })
    }
  }

  const handleColorChange = (key: keyof ColorTheme, value: string) => {
    const newTheme = {
      ...customization.colorTheme,
      [key]: value
    }
    onCustomizationChange({
      ...customization,
      colorTheme: newTheme,
      customColors: {
        ...customization.customColors,
        [key]: value
      }
    })
    setActiveTheme('custom')
  }

  const handleTextChange = (key: keyof CustomText, value: string) => {
    const newText = {
      ...customization.customText,
      [key]: value
    }
    onCustomizationChange({
      ...customization,
      customText: newText
    })
  }

  const resetTextToDefaults = () => {
    onCustomizationChange({
      ...customization,
      customText: DEFAULT_TEXT
    })
  }

  const resetToDefaults = () => {
    setActiveTheme('classic-green')
    onCustomizationChange(DEFAULT_CUSTOMIZATION)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Customization
            </CardTitle>
            <CardDescription>Customize your offer preview</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">
              <Layout className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="text">
              <Type className="h-4 w-4 mr-2" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="space-y-3">
              {(Object.keys(TEMPLATE_DESCRIPTIONS) as TemplateType[]).map((templateKey) => {
                const template = TEMPLATE_DESCRIPTIONS[templateKey]
                const isActive = customization.template === templateKey
                return (
                  <button
                    key={templateKey}
                    onClick={() => handleTemplateChange(templateKey)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 mb-1">
                      {template.name}
                    </div>
                    <div className="text-sm text-slate-600">
                      {template.description}
                    </div>
                  </button>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4 mt-4">
            {/* Predefined Themes */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Predefined Themes</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      activeTheme === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                      />
                    </div>
                    <div className="text-xs font-medium text-slate-900">
                      {theme.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-semibold mb-3 block">
                Custom Colors {activeTheme === 'custom' && '(Active)'}
              </Label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-600 mb-1.5 block">Primary</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customization.colorTheme.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-12 h-9 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={customization.colorTheme.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="flex-1 font-mono text-xs"
                        placeholder="#10b981"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600 mb-1.5 block">Secondary</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customization.colorTheme.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="w-12 h-9 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={customization.colorTheme.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="flex-1 font-mono text-xs"
                        placeholder="#059669"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600 mb-1.5 block">Accent</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customization.colorTheme.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="w-12 h-9 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={customization.colorTheme.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="flex-1 font-mono text-xs"
                        placeholder="#dc2626"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600 mb-1.5 block">Text</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customization.colorTheme.text}
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        className="w-12 h-9 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={customization.colorTheme.text}
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        className="flex-1 font-mono text-xs"
                        placeholder="#0f172a"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600 mb-1.5 block">Background</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customization.colorTheme.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="w-12 h-9 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={customization.colorTheme.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="flex-1 font-mono text-xs"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600 mb-1.5 block">Border</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customization.colorTheme.border}
                        onChange={(e) => handleColorChange('border', e.target.value)}
                        className="w-12 h-9 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={customization.colorTheme.border}
                        onChange={(e) => handleColorChange('border', e.target.value)}
                        className="flex-1 font-mono text-xs"
                        placeholder="#e2e8f0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Customize Text</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetTextToDefaults}
                  className="gap-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset Text
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-600 mb-1.5 block">Header Text</Label>
                  <Textarea
                    value={customization.customText.headerText}
                    onChange={(e) => handleTextChange('headerText', e.target.value)}
                    placeholder={DEFAULT_TEXT.headerText}
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-600 mb-1.5 block">Price Label</Label>
                  <Input
                    value={customization.customText.priceLabel}
                    onChange={(e) => handleTextChange('priceLabel', e.target.value)}
                    placeholder={DEFAULT_TEXT.priceLabel}
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-600 mb-1.5 block">Button Text</Label>
                  <Input
                    value={customization.customText.buttonText}
                    onChange={(e) => handleTextChange('buttonText', e.target.value)}
                    placeholder={DEFAULT_TEXT.buttonText}
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-600 mb-1.5 block">Total Value Label</Label>
                  <Input
                    value={customization.customText.totalValueLabel}
                    onChange={(e) => handleTextChange('totalValueLabel', e.target.value)}
                    placeholder={DEFAULT_TEXT.totalValueLabel}
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-600 mb-1.5 block">Value Label</Label>
                  <Input
                    value={customization.customText.valueLabel}
                    onChange={(e) => handleTextChange('valueLabel', e.target.value)}
                    placeholder={DEFAULT_TEXT.valueLabel}
                  />
                  <p className="text-xs text-slate-500 mt-1">Appears after product values (e.g., "$97 Value")</p>
                </div>

                <div>
                  <Label className="text-xs text-slate-600 mb-1.5 block">Bonus Badge</Label>
                  <Input
                    value={customization.customText.bonusBadge}
                    onChange={(e) => handleTextChange('bonusBadge', e.target.value)}
                    placeholder={DEFAULT_TEXT.bonusBadge}
                  />
                  <p className="text-xs text-slate-500 mt-1">Text shown on bonus product badges</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
