'use client'

import { Offer, Product } from '@prisma/client'
import { Check } from 'lucide-react'
import { OfferCustomization } from '@/types/customization'

type OfferWithProducts = Offer & {
  products: Product[]
}

interface OfferPreviewCustomizableProps {
  offer: OfferWithProducts
  customization: OfferCustomization
}

export function OfferPreviewCustomizable({ offer, customization }: OfferPreviewCustomizableProps) {
  const { colorTheme, template, customText } = customization
  const multiplier = offer.price > 0 ? (offer.totalValue / offer.price).toFixed(1) : '0.0'
  const regularProducts = offer.products.filter((p) => !p.isBonus)
  const bonuses = offer.products.filter((p) => p.isBonus)

  // Template-specific styles
  const getTemplateStyles = () => {
    switch (template) {
      case 'minimal-stack':
        return {
          container: 'rounded-3xl',
          headerPadding: 'px-12 py-12',
          headerTextSize: 'text-2xl',
          productsPadding: 'px-12 py-10',
          productSpacing: 'space-y-6',
          productTextSize: 'text-base',
          valueTextSize: 'text-lg',
          totalValueTextSize: 'text-4xl',
          priceTextSize: 'text-5xl',
          buttonPadding: 'py-5',
          buttonTextSize: 'text-xl'
        }
      case 'bold-stack':
        return {
          container: 'rounded-xl',
          headerPadding: 'px-10 py-12',
          headerTextSize: 'text-4xl',
          productsPadding: 'px-10 py-10',
          productSpacing: 'space-y-5',
          productTextSize: 'text-xl',
          valueTextSize: 'text-2xl',
          totalValueTextSize: 'text-6xl',
          priceTextSize: 'text-7xl',
          buttonPadding: 'py-7',
          buttonTextSize: 'text-3xl'
        }
      case 'classic-stack':
      default:
        return {
          container: 'rounded-2xl',
          headerPadding: 'px-8 py-10',
          headerTextSize: 'text-3xl',
          productsPadding: 'px-8 py-8',
          productSpacing: 'space-y-4',
          productTextSize: 'text-lg',
          valueTextSize: 'text-xl',
          totalValueTextSize: 'text-5xl',
          priceTextSize: 'text-6xl',
          buttonPadding: 'py-6',
          buttonTextSize: 'text-2xl'
        }
    }
  }

  const styles = getTemplateStyles()

  return (
    <div className="w-full">
      {/* Stack Slide */}
      <div
        className={`overflow-hidden ${styles.container} border-2 shadow-2xl`}
        style={{
          borderColor: colorTheme.border,
          backgroundColor: colorTheme.background
        }}
      >
        {/* Header */}
        <div
          className={`${styles.headerPadding} text-center`}
          style={{
            background: `linear-gradient(to right, ${colorTheme.primary}, ${colorTheme.secondary})`
          }}
        >
          <h2
            className={`${styles.headerTextSize} font-bold`}
            style={{ color: colorTheme.background }}
          >
            {customText.headerText}
          </h2>
        </div>

        {/* Products List */}
        <div
          className={`${styles.productSpacing} ${styles.productsPadding}`}
          style={{ backgroundColor: colorTheme.background }}
        >
          {regularProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: colorTheme.primary }}
                />
                <span
                  className={`${styles.productTextSize}`}
                  style={{ color: colorTheme.text }}
                >
                  {product.name}
                </span>
              </div>
              <span
                className={`whitespace-nowrap ${styles.valueTextSize} font-semibold`}
                style={{ color: colorTheme.accent }}
              >
                (${product.value.toFixed(2)} {customText.valueLabel})
              </span>
            </div>
          ))}

          {bonuses.map((bonus) => (
            <div key={bonus.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: colorTheme.primary }}
                />
                <div className="flex items-center gap-2">
                  <span
                    className={`${styles.productTextSize}`}
                    style={{ color: colorTheme.text }}
                  >
                    {bonus.name}
                  </span>
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: `${colorTheme.accent}20`,
                      color: colorTheme.accent
                    }}
                  >
                    {customText.bonusBadge}
                  </span>
                </div>
              </div>
              <span
                className={`whitespace-nowrap ${styles.valueTextSize} font-semibold`}
                style={{ color: colorTheme.accent }}
              >
                (${bonus.value.toFixed(2)} {customText.valueLabel})
              </span>
            </div>
          ))}
        </div>

        {/* Total Value */}
        <div
          className="border-t-2 px-8 py-6 text-center"
          style={{
            borderColor: colorTheme.border,
            backgroundColor: template === 'minimal-stack' ? colorTheme.background : `${colorTheme.border}50`
          }}
        >
          <p
            className="mb-2 text-xl font-semibold"
            style={{ color: colorTheme.text }}
          >
            {customText.totalValueLabel}
          </p>
          <p
            className={`${styles.totalValueTextSize} font-bold`}
            style={{ color: colorTheme.accent }}
          >
            ${offer.totalValue.toFixed(2)}
          </p>
        </div>

        {/* Price */}
        <div
          className="px-8 py-6 text-center"
          style={{ backgroundColor: colorTheme.background }}
        >
          <p
            className="mb-2 text-xl font-semibold"
            style={{ color: colorTheme.text }}
          >
            {customText.priceLabel}
          </p>
          <p
            className={`${styles.priceTextSize} font-bold`}
            style={{ color: colorTheme.primary }}
          >
            ${offer.price.toFixed(2)}!
          </p>
        </div>

        {/* CTA */}
        <div
          className="px-8 pb-8"
          style={{ backgroundColor: colorTheme.background }}
        >
          <button
            className={`w-full rounded-xl ${styles.buttonPadding} ${styles.buttonTextSize} font-bold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl`}
            style={{
              background: `linear-gradient(to right, ${colorTheme.primary}, ${colorTheme.secondary})`,
              color: colorTheme.background
            }}
          >
            {customText.buttonText}
          </button>
        </div>
      </div>

      {offer.products.length === 0 && (
        <div
          className="mt-6 rounded-xl border p-8 text-center"
          style={{
            borderColor: colorTheme.border,
            backgroundColor: colorTheme.background
          }}
        >
          <p style={{ color: `${colorTheme.text}80` }}>
            Add products to see your offer preview
          </p>
        </div>
      )}
    </div>
  )
}
