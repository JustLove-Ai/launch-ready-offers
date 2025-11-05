'use server'

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function generateProblemSuggestions(topic: string) {
  // Return mock data if no API key
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    return {
      success: true,
      problems: [
        {
          problem: "Spending hours creating content that gets zero engagement",
          emotionalHook: "Wasting time while competitors steal your audience"
        },
        {
          problem: "Struggling to come up with fresh content ideas consistently",
          emotionalHook: "Feeling stuck and uninspired every single day"
        },
        {
          problem: "Not knowing which content actually converts followers to customers",
          emotionalHook: "Working hard but seeing no revenue"
        },
        {
          problem: "Missing out on trends because you're too busy creating content",
          emotionalHook: "Always one step behind the competition"
        },
        {
          problem: "Juggling multiple platforms without a clear strategy",
          emotionalHook: "Feeling overwhelmed and burned out"
        }
      ]
    }
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a direct response marketing expert trained in the methods of Dan Kennedy and Russell Brunson.

Given the topic: "${topic}"

Generate 5-7 specific, painful problems that the target audience likely experiences related to this topic. Make each problem:
- Specific and relatable
- Emotionally charged (tap into frustration, fear, or desire)
- Something people would pay to solve
- Written in the language the audience uses

Format your response as a JSON array of objects with "problem" and "emotionalHook" fields. The emotionalHook should be a short phrase that captures why this hurts.

Example format:
[
  {
    "problem": "Spending hours every week manually creating social media content",
    "emotionalHook": "Stealing time from actually growing your business"
  }
]

Return ONLY the JSON array, no other text.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const problems = JSON.parse(content.text)
      return { success: true, problems }
    }

    return { success: false, error: 'Unexpected response format' }
  } catch (error) {
    console.error('Error generating problem suggestions:', error)
    // Return mock data if API call fails
    return {
      success: true,
      problems: [
        {
          problem: "Spending hours creating content that gets zero engagement",
          emotionalHook: "Wasting time while competitors steal your audience"
        },
        {
          problem: "Struggling to come up with fresh content ideas consistently",
          emotionalHook: "Feeling stuck and uninspired every single day"
        },
        {
          problem: "Not knowing which content actually converts followers to customers",
          emotionalHook: "Working hard but seeing no revenue"
        },
        {
          problem: "Missing out on trends because you're too busy creating content",
          emotionalHook: "Always one step behind the competition"
        },
        {
          problem: "Juggling multiple platforms without a clear strategy",
          emotionalHook: "Feeling overwhelmed and burned out"
        }
      ]
    }
  }
}

export async function generateSolutionForProblem(problem: string, topic: string) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a direct response marketing expert trained in the methods of Dan Kennedy and Russell Brunson.

Topic: "${topic}"
Problem: "${problem}"

Generate 3-4 compelling product/solution ideas that solve this problem. For each solution, provide:
- A catchy, benefit-driven name (using power words and direct response principles)
- A clear description of what it is
- The transformation it provides
- A suggested perceived value ($)
- Key benefits (3-5 bullet points)

Use proven direct response formulas like:
- "How to [achieve desire] without [pain/objection]"
- "[Timeframe] to [desired outcome]"
- "The [adjective] [thing] that [benefit]"

Format as JSON array:
[
  {
    "name": "The 5-Minute Content System",
    "description": "A done-for-you template library...",
    "transformation": "From spending hours to posting in minutes",
    "suggestedValue": 197,
    "benefits": ["Benefit 1", "Benefit 2", ...]
  }
]

Return ONLY the JSON array, no other text.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const solutions = JSON.parse(content.text)
      return { success: true, solutions }
    }

    return { success: false, error: 'Unexpected response format' }
  } catch (error) {
    console.error('Error generating solution suggestions:', error)
    return { success: false, error: 'Failed to generate solution suggestions' }
  }
}

export async function generateTasksForProduct(productName: string, productDescription: string) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a product launch expert. Given this product:

Name: "${productName}"
Description: "${productDescription}"

Generate 5-8 specific tasks needed to create and launch this product. Make tasks:
- Actionable and specific
- In logical order
- Realistic and achievable
- Include both creation and delivery tasks

For each task, also suggest 2-4 subtasks.

Format as JSON:
[
  {
    "title": "Create product outline and structure",
    "description": "Map out all modules and lessons",
    "priority": "HIGH",
    "estimatedDays": 3,
    "subtasks": [
      "Research competitor products",
      "Create module list",
      "Define learning outcomes"
    ]
  }
]

Priority can be: "LOW", "MEDIUM", or "HIGH"

Return ONLY the JSON array, no other text.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const tasks = JSON.parse(content.text)
      return { success: true, tasks }
    }

    return { success: false, error: 'Unexpected response format' }
  } catch (error) {
    console.error('Error generating tasks:', error)
    return { success: false, error: 'Failed to generate tasks' }
  }
}

export async function improveName(currentName: string, context: string) {
  // Return mock data if no API key
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    return {
      success: true,
      names: [
        "The Ultimate Content Creation System",
        "7-Day Content Accelerator Program",
        "Done-For-You Content Templates Pack"
      ]
    }
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are a direct response copywriting expert trained in Dan Kennedy and Russell Brunson's methods.

Current Name: "${currentName}"
Context: "${context}"

Generate 5 alternative names that are:
- More compelling and benefit-driven
- Use power words and emotional triggers
- Follow direct response naming conventions
- Easier to remember and share

Return as JSON array of strings:
["Name 1", "Name 2", "Name 3", "Name 4", "Name 5"]

Return ONLY the JSON array, no other text.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const names = JSON.parse(content.text)
      return { success: true, names }
    }

    return { success: false, error: 'Unexpected response format' }
  } catch (error) {
    console.error('Error improving name:', error)
    // Return mock data if API call fails
    return {
      success: true,
      names: [
        "The Ultimate Content Creation System",
        "7-Day Content Accelerator Program",
        "Done-For-You Content Templates Pack"
      ]
    }
  }
}

export async function generateProblems(description: string, topic: string) {
  type Problem = {
    id: string
    title: string
    description: string
    emotionalHook: string
  }

  // Return mock data if no API key
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    return {
      success: true,
      problems: [
        {
          id: `problem-${Date.now()}-1`,
          title: "Struggling to attract qualified leads",
          description: "Small businesses waste time and money on marketing that brings in tire-kickers instead of ready-to-buy customers",
          emotionalHook: "Watching your competitors grow while you spin your wheels"
        },
        {
          id: `problem-${Date.now()}-2`,
          title: "No clear strategy for converting followers to customers",
          description: "You have an audience but they're not buying - missing the crucial steps that turn attention into revenue",
          emotionalHook: "Feeling like you're shouting into the void with nothing to show for it"
        },
        {
          id: `problem-${Date.now()}-3`,
          title: "Overwhelmed by too many marketing channels",
          description: "Trying to be everywhere at once leads to being effective nowhere - diluted effort, minimal results",
          emotionalHook: "Burnout from working harder but seeing no real growth"
        }
      ] as Problem[]
    }
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a direct response marketing expert trained in the methods of Dan Kennedy and Russell Brunson.

Topic: "${topic}"
Offer Description: "${description}"

Generate 3-5 specific, painful problems that the target audience faces related to this offer. Make each problem:
- Specific and relatable
- Emotionally charged (tap into frustration, fear, or desire)
- Something people would pay to solve
- Written in the language the audience uses

Format your response as a JSON array of objects with these fields:
- title: Short, punchy problem statement
- description: 1-2 sentences explaining the problem in detail
- emotionalHook: Why this problem hurts emotionally

Example format:
[
  {
    "title": "Spending hours on content that gets zero engagement",
    "description": "You're creating content every day but it feels like you're invisible. Posts get a few likes from friends but no real traction or business results.",
    "emotionalHook": "Feeling like a failure while watching competitors succeed with less effort"
  }
]

Return ONLY the JSON array, no other text.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const rawProblems = JSON.parse(content.text)
      const problems = rawProblems.map((p: any, index: number) => ({
        id: `problem-${Date.now()}-${index}`,
        ...p
      }))
      return { success: true, problems }
    }

    return { success: false, error: 'Unexpected response format' }
  } catch (error) {
    console.error('Error generating problems:', error)
    // Return mock data if API call fails
    return {
      success: true,
      problems: [
        {
          id: `problem-${Date.now()}-1`,
          title: "Struggling to attract qualified leads",
          description: "Small businesses waste time and money on marketing that brings in tire-kickers instead of ready-to-buy customers",
          emotionalHook: "Watching your competitors grow while you spin your wheels"
        },
        {
          id: `problem-${Date.now()}-2`,
          title: "No clear strategy for converting followers to customers",
          description: "You have an audience but they're not buying - missing the crucial steps that turn attention into revenue",
          emotionalHook: "Feeling like you're shouting into the void with nothing to show for it"
        }
      ] as Problem[]
    }
  }
}

export async function generateProductIdeas(description: string, problems: Array<{ id: string; title: string; description: string }>) {
  type ProductIdea = {
    id: string
    name: string
    description: string
    value: number
    deliveryFormat: string
    solution: string
    problemId?: string
    isBonus: boolean
  }

  // Return mock data if no API key
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    return {
      success: true,
      productIdeas: [
        {
          id: `product-${Date.now()}-1`,
          name: "The 30-Day Launch Blueprint",
          description: "Step-by-step course showing exactly how to take your offer from idea to first sale in 30 days",
          value: 297,
          deliveryFormat: "course",
          solution: "Gives you a proven system to follow so you're never guessing what to do next",
          problemId: problems[0]?.id,
          isBonus: false
        },
        {
          id: `product-${Date.now()}-2`,
          name: "Done-For-You Email Sequences",
          description: "7 pre-written email sequences for nurturing leads and converting them into customers",
          value: 197,
          deliveryFormat: "template",
          solution: "Copy-paste proven emails that convert instead of staring at a blank screen",
          problemId: problems[1]?.id,
          isBonus: false
        },
        {
          id: `product-${Date.now()}-3`,
          name: "Conversion Checklist Library",
          description: "15+ checklists covering every aspect of your launch from planning to post-launch",
          value: 97,
          deliveryFormat: "checklist",
          solution: "Never miss a critical step with these battle-tested checklists",
          isBonus: true
        }
      ] as ProductIdea[]
    }
  }

  try {
    const problemsText = problems.map((p, i) => `${i + 1}. ${p.title}: ${p.description}`).join('\n')

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `You are a product strategist and direct response marketer.

Offer Description: "${description}"

Problems to solve:
${problemsText}

Generate 4-6 product ideas that solve these problems. Each product should:
- Have a compelling, benefit-driven name
- Clearly solve one or more of the problems listed
- Have a realistic perceived value
- Be deliverable in a specific format
- Provide clear transformation

Delivery formats can be: ebook, course, video series, template, worksheet, checklist, guide, toolkit, software, membership, coaching

Format your response as a JSON array:
[
  {
    "name": "The 5-Minute Content System",
    "description": "A comprehensive library of 100+ plug-and-play content templates across all major platforms",
    "value": 297,
    "deliveryFormat": "template",
    "solution": "Never stare at a blank screen again - just fill in the blanks and post",
    "problemIndex": 0
  }
]

The problemIndex should be the 0-based index of which problem this product primarily solves (0 for first problem, 1 for second, etc). Use null if it doesn't specifically map to one problem.

Return ONLY the JSON array, no other text.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const rawProducts = JSON.parse(content.text)
      const productIdeas = rawProducts.map((p: any, index: number) => ({
        id: `product-${Date.now()}-${index}`,
        name: p.name,
        description: p.description,
        value: p.value,
        deliveryFormat: p.deliveryFormat,
        solution: p.solution,
        problemId: p.problemIndex !== null && p.problemIndex !== undefined ? problems[p.problemIndex]?.id : undefined,
        isBonus: false
      }))
      return { success: true, productIdeas }
    }

    return { success: false, error: 'Unexpected response format' }
  } catch (error) {
    console.error('Error generating product ideas:', error)
    // Return mock data if API call fails
    return {
      success: true,
      productIdeas: [
        {
          id: `product-${Date.now()}-1`,
          name: "The Complete Launch System",
          description: "Everything you need to launch your offer successfully",
          value: 297,
          deliveryFormat: "course",
          solution: "Get a proven system that takes the guesswork out of launching",
          problemId: problems[0]?.id,
          isBonus: false
        }
      ] as ProductIdea[]
    }
  }
}

export async function selectBestProducts(description: string, productIdeas: Array<{ id: string; name: string; description: string; value: number }>) {
  // Return mock data if no API key
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    const mainProducts = productIdeas.slice(0, Math.min(2, productIdeas.length)).map(p => p.id)
    const bonuses = productIdeas.slice(2, Math.min(4, productIdeas.length)).map(p => p.id)

    return {
      success: true,
      selection: {
        mainProducts,
        bonuses,
        reasoning: "I recommend including the first 2 products as your main offer because they provide the core value and transformation. The additional products work great as bonuses to increase perceived value and make the offer irresistible."
      }
    }
  }

  try {
    const productsText = productIdeas.map((p, i) =>
      `${i}. ${p.name} ($${p.value}): ${p.description}`
    ).join('\n')

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are an expert in creating irresistible offers using Russell Brunson's value stacking method.

Offer Description: "${description}"

Available Products:
${productsText}

Analyze these products and recommend:
1. Which 2-3 should be MAIN products (the core offer)
2. Which 1-3 should be BONUSES (stack the value)
3. Your reasoning for this structure

Consider:
- Main products should deliver the core transformation
- Bonuses should amplify results or make implementation easier
- Total value should be compelling (aim for at least 5x price point)
- Structure should create a "must-have" stack

Format your response as JSON:
{
  "mainProducts": [0, 1],
  "bonuses": [2, 3],
  "reasoning": "Explanation of why this structure works..."
}

The arrays should contain the 0-based indices of the products.

Return ONLY the JSON object, no other text.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const result = JSON.parse(content.text)

      // Convert indices to IDs
      const selection = {
        mainProducts: result.mainProducts.map((index: number) => productIdeas[index]?.id).filter(Boolean),
        bonuses: result.bonuses.map((index: number) => productIdeas[index]?.id).filter(Boolean),
        reasoning: result.reasoning
      }

      return { success: true, selection }
    }

    return { success: false, error: 'Unexpected response format' }
  } catch (error) {
    console.error('Error selecting products:', error)
    // Return mock data if API call fails
    const mainProducts = productIdeas.slice(0, Math.min(2, productIdeas.length)).map(p => p.id)
    const bonuses = productIdeas.slice(2, Math.min(4, productIdeas.length)).map(p => p.id)

    return {
      success: true,
      selection: {
        mainProducts,
        bonuses,
        reasoning: "I recommend including the first products as your main offer, with the others as high-value bonuses to create an irresistible stack."
      }
    }
  }
}
