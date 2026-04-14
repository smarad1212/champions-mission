import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider } from './types'

let client: Anthropic | null = null
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return client
}

export const claudeProvider: AIProvider = {
  async generateContent(systemPrompt, userPrompt) {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type')
    return block.text
  },
}
