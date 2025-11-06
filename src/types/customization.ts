// Customization types for offer preview

export type TemplateType = 'classic-stack' | 'minimal-stack' | 'bold-stack'

export interface ColorTheme {
  name: string
  primary: string        // Main CTA button, highlights
  secondary: string      // Header background
  accent: string         // Value text, emphasis
  text: string          // Main text color
  background: string    // Background color
  border: string        // Border colors
}

export interface CustomText {
  headerText: string        // Main header at top
  totalValueLabel: string   // "Total Value:" text
  priceLabel: string        // "Get Your Copy Today For" text
  buttonText: string        // CTA button text
  bonusBadge: string       // "BONUS!" badge text
  valueLabel: string       // "($ Value)" text suffix
}

export interface OfferCustomization {
  template: TemplateType
  colorTheme: ColorTheme
  customColors?: Partial<ColorTheme>  // Override specific colors
  customText: CustomText
}

// Predefined color themes
export const COLOR_THEMES: Record<string, ColorTheme> = {
  'classic-green': {
    name: 'Classic Green',
    primary: '#10b981',      // emerald-500
    secondary: '#059669',    // emerald-600
    accent: '#dc2626',       // red-600
    text: '#0f172a',        // slate-900
    background: '#ffffff',   // white
    border: '#e2e8f0'       // slate-200
  },
  'blue-professional': {
    name: 'Blue Professional',
    primary: '#3b82f6',      // blue-500
    secondary: '#2563eb',    // blue-600
    accent: '#f59e0b',       // amber-500
    text: '#1e293b',        // slate-800
    background: '#ffffff',   // white
    border: '#cbd5e1'       // slate-300
  },
  'purple-modern': {
    name: 'Purple Modern',
    primary: '#a855f7',      // purple-500
    secondary: '#9333ea',    // purple-600
    accent: '#ec4899',       // pink-500
    text: '#0f172a',        // slate-900
    background: '#ffffff',   // white
    border: '#e2e8f0'       // slate-200
  },
  'red-bold': {
    name: 'Red Bold',
    primary: '#ef4444',      // red-500
    secondary: '#dc2626',    // red-600
    accent: '#eab308',       // yellow-500
    text: '#0f172a',        // slate-900
    background: '#ffffff',   // white
    border: '#e2e8f0'       // slate-200
  },
  'orange-energy': {
    name: 'Orange Energy',
    primary: '#f97316',      // orange-500
    secondary: '#ea580c',    // orange-600
    accent: '#06b6d4',       // cyan-500
    text: '#0f172a',        // slate-900
    background: '#ffffff',   // white
    border: '#e2e8f0'       // slate-200
  },
  'dark-mode': {
    name: 'Dark Mode',
    primary: '#8b5cf6',      // violet-500
    secondary: '#7c3aed',    // violet-600
    accent: '#14b8a6',       // teal-500
    text: '#f8fafc',        // slate-50
    background: '#0f172a',   // slate-900
    border: '#334155'       // slate-700
  }
}

// Default text values
export const DEFAULT_TEXT: CustomText = {
  headerText: 'Let Me Show You EVERYTHING You Get When You Order Today!',
  totalValueLabel: 'Total Value:',
  priceLabel: 'Get Your Copy Today For',
  buttonText: 'YES! RESERVE MY COPY NOW!',
  bonusBadge: 'BONUS!',
  valueLabel: 'Value'
}

// Default customization
export const DEFAULT_CUSTOMIZATION: OfferCustomization = {
  template: 'classic-stack',
  colorTheme: COLOR_THEMES['classic-green'],
  customText: DEFAULT_TEXT
}

// Template descriptions
export const TEMPLATE_DESCRIPTIONS: Record<TemplateType, { name: string; description: string }> = {
  'classic-stack': {
    name: 'Classic Stack',
    description: 'Traditional Russell Brunson style with bold emphasis on value'
  },
  'minimal-stack': {
    name: 'Minimal Stack',
    description: 'Clean and modern with generous whitespace'
  },
  'bold-stack': {
    name: 'Bold Stack',
    description: 'Large typography and dramatic CTAs for maximum impact'
  }
}
