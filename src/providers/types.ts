export interface AIProvider {
  generateContent(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string>
}
