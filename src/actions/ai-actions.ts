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
