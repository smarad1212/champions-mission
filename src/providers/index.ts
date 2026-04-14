import { claudeProvider } from './claude'
import { geminiProvider } from './gemini'
import type { AIProvider } from './types'

export function getProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'claude'
  if (provider === 'gemini') return geminiProvider
  if (provider === 'claude') return claudeProvider
  throw new Error(`Unknown AI provider: ${provider}`)
}
