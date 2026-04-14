import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider } from './types'

let genAI: GoogleGenerativeAI | null = null

function getModel() {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    } as Parameters<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']>[0]['generationConfig'],
  })
}

export const geminiProvider: AIProvider = {
  async generateContent(systemPrompt, userPrompt) {
    const model = getModel()
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`)
    return result.response.text()
  },
}
