// Utility functions for working with offer customization

import { Offer } from '@prisma/client'
import { OfferCustomization, COLOR_THEMES, DEFAULT_CUSTOMIZATION, DEFAULT_TEXT, ColorTheme, TemplateType, CustomText } from '@/types/customization'

/**
 * Extract customization settings from an Offer model
 */
export function getCustomizationFromOffer(offer: Offer): OfferCustomization {
  // Get base theme
  const baseTheme = COLOR_THEMES[offer.themeName || 'classic-green'] || COLOR_THEMES['classic-green']

  // Apply custom color overrides if present
  const colorTheme: ColorTheme = {
    ...baseTheme,
    primary: offer.customPrimary || baseTheme.primary,
    secondary: offer.customSecondary || baseTheme.secondary,
    accent: offer.customAccent || baseTheme.accent,
    text: offer.customText || baseTheme.text,
    background: offer.customBackground || baseTheme.background,
    border: offer.customBorder || baseTheme.border,
  }

  // Apply custom text overrides if present
  const customText: CustomText = {
    headerText: offer.customHeaderText || DEFAULT_TEXT.headerText,
    totalValueLabel: offer.customTotalValueLabel || DEFAULT_TEXT.totalValueLabel,
    priceLabel: offer.customPriceLabel || DEFAULT_TEXT.priceLabel,
    buttonText: offer.customButtonText || DEFAULT_TEXT.buttonText,
    bonusBadge: offer.customBonusBadge || DEFAULT_TEXT.bonusBadge,
    valueLabel: offer.customValueLabel || DEFAULT_TEXT.valueLabel,
  }

  return {
    template: (offer.template as TemplateType) || DEFAULT_CUSTOMIZATION.template,
    colorTheme,
    customText,
    customColors: offer.customPrimary || offer.customSecondary || offer.customAccent ||
                  offer.customText || offer.customBackground || offer.customBorder
      ? {
          primary: offer.customPrimary,
          secondary: offer.customSecondary,
          accent: offer.customAccent,
          text: offer.customText,
          background: offer.customBackground,
          border: offer.customBorder,
        }
      : undefined
  }
}

/**
 * Convert OfferCustomization to database update format
 */
export function customizationToDbFormat(customization: OfferCustomization) {
  // Determine theme name
  let themeName = 'custom'

  // Check if colors match any predefined theme
  const matchingTheme = Object.entries(COLOR_THEMES).find(([_, theme]) =>
    theme.primary === customization.colorTheme.primary &&
    theme.secondary === customization.colorTheme.secondary &&
    theme.accent === customization.colorTheme.accent &&
    theme.text === customization.colorTheme.text &&
    theme.background === customization.colorTheme.background &&
    theme.border === customization.colorTheme.border
  )

  if (matchingTheme) {
    themeName = matchingTheme[0]
  }

  return {
    template: customization.template,
    themeName,
    customPrimary: customization.customColors?.primary || null,
    customSecondary: customization.customColors?.secondary || null,
    customAccent: customization.customColors?.accent || null,
    customText: customization.customColors?.text || null,
    customBackground: customization.customColors?.background || null,
    customBorder: customization.customColors?.border || null,
    customHeaderText: customization.customText.headerText !== DEFAULT_TEXT.headerText
      ? customization.customText.headerText : null,
    customTotalValueLabel: customization.customText.totalValueLabel !== DEFAULT_TEXT.totalValueLabel
      ? customization.customText.totalValueLabel : null,
    customPriceLabel: customization.customText.priceLabel !== DEFAULT_TEXT.priceLabel
      ? customization.customText.priceLabel : null,
    customButtonText: customization.customText.buttonText !== DEFAULT_TEXT.buttonText
      ? customization.customText.buttonText : null,
    customBonusBadge: customization.customText.bonusBadge !== DEFAULT_TEXT.bonusBadge
      ? customization.customText.bonusBadge : null,
    customValueLabel: customization.customText.valueLabel !== DEFAULT_TEXT.valueLabel
      ? customization.customText.valueLabel : null,
  }
}
