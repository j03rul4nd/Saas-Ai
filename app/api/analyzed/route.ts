import { NextResponse, NextRequest } from 'next/server'
import { handleApiError, ApiError } from '@/lib/errors'
import { rateLimiter } from '@/lib/rateLimiters'
import { API, PDF_PROCESSING } from '@/lib/constants'
import { auth } from '@clerk/nextjs/server'
import { checkAndIncrementPromptUsage, incrementPromptUsage } from '@/lib/promptLimits'

export async function POST(request: NextRequest) {
  try {
    await rateLimiter(request)

    // Verificar autenticación
    const { userId } = await auth()
    if (!userId) {
      throw new ApiError(401, 'Unauthorised. You must log in to use this feature.')
    }

    const body = await request.json().catch(() => ({}))
    const { text } = body
    
    if (!text || typeof text !== 'string') {
      throw new ApiError(400, 'Invalid input: text is required and must be a string')
    }

    if (text.length === 0) {
      throw new ApiError(400, 'Invalid input: text cannot be empty')
    }

    // Verificar límites de prompts antes de procesar
    const promptLimitResult = await checkAndIncrementPromptUsage(userId)
    
    if (!promptLimitResult.canUse) {
      throw new ApiError(429, `You have reached your monthly limit of ${promptLimitResult.monthlyLimit} prompts. The limit will reset on ${promptLimitResult.nextResetDate.toLocaleDateString('en-US')}.`);
    }

    const processedText = text.substring(0, PDF_PROCESSING.MAX_TEXT_LENGTH)

    const response = await fetch(
      `${API.GEMINI_ENDPOINT}?key=${process.env.GEMINI_API_KEY}`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `
                  Please analyze this document and provide an elegant, narrative summary with the following format:

                  # Document Overview
                  Write a concise 2 sentence overview that captures the essence of the document. 
                  Focus on the main subject, purpose, and scope.
                  Use **bold** for key concepts.

                  ## Main Insights
                  Provide 1 well-crafted paragraph, max 3 sentences, that explain the key arguments or findings from the document. 
                  Use clear, engaging language and focus on the most important information. 
                  Avoid bullet points and instead create a flowing narrative.
                  - **Core findings** with specific data or quotes using > blockquotes
                  - Most significant discoveries or arguments
                  Use *italics* for emphasis and \`code formatting\` for technical terms.


                  ## Critical Analysis
                  In 1 paragraph, max 3 sentences, analyze the document's methodology, approach, or perspective. 
                  Discuss any notable strengths, limitations, or unique aspects. 
                  Include relevant data or quotes if they enhance understanding.
                  - **Methodology/approach** and credibility
                  - Notable strengths or limitations
                  - Include relevant quotes in blockquotes when valuable

                  ## Conclusion
                  Write a thoughtful concluding paragraph that summarizes the document's significance and main takeaways. 
                  What should the reader remember from this document? Max 2 senteces

                  Format the response with clear headings and well-structured paragraphs. 
                  Use professional, concise language throughout.
                  - Use markdown extensively (bold, italics, blockquotes, code, url)

                  Document content: 
                  ${processedText}
              `
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      throw new ApiError(
        response.status, 
        errorData.error?.message || `Failed to analyze document: ${response.statusText}`,
        errorData
      )
    }

    const data = await response.json()
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new ApiError(500, 'Invalid response from AI service')
    }

    // Incrementar el contador de uso solo si la API fue exitosa
    await incrementPromptUsage(userId)

    return NextResponse.json({ 
      summary: data.candidates[0].content.parts[0].text,
      promptUsage: {
        remaining: promptLimitResult.remainingPrompts - 1, // -1 porque ya incrementamos
        used: promptLimitResult.currentUsage + 1,
        limit: promptLimitResult.monthlyLimit,
        nextReset: promptLimitResult.nextResetDate
      }
    })

  } catch (error) {
    return handleApiError(error)
  }
}