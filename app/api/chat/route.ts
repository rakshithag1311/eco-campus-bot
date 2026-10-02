import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { awardEcoPointsServer } from '@/lib/eco-points'

export const maxDuration = 30

const SYSTEM_PROMPT = `You are Eco Bot, the official AI sustainability assistant for Eco Campus Bot. You help university students with ALL waste and sustainability related questions.

Your core responsibilities:
1. WASTE CLASSIFICATION — When given an image, identify the item(s) and classify as: General Waste, Recyclable (plastic/paper/glass/metal), Organic/Food Waste, E-waste (electronics/batteries/cables), Hazardous Waste (chemicals/paint/medical), or Textile/Clothing.
2. DISPOSAL GUIDANCE — Tell students exactly which bin or collection point to use on campus.
3. CAMPUS DISPOSAL POINTS — Reference these campus locations:
   - General Waste Bins: Available at every building entrance and corridor
   - Recycling Bins (Blue): Library Ground Floor, Student Centre, Cafeteria, Hostels A/B/C
   - E-waste Collection: Library Block Ground Floor (Bin B2), IT Department, Main Admin Office
   - Organic/Food Waste (Green Bins): Cafeteria, Hostel Dining Areas
   - Hazardous Waste: Safety Office, Chemistry Department (by appointment)
   - Clothing/Textile Donation: Student Centre, Ground Floor (Mon–Fri 9am–5pm)
4. IMAGE ANALYSIS — When a user sends a photo, identify what the item is, classify it, and give specific disposal instructions.
5. ECO TIPS — Share practical sustainability tips for campus life.
6. GENERAL WASTE QUESTIONS — Answer any question about waste management, recycling, composting, sustainability, environmental impact, or eco-friendly practices.

Tone: Friendly, encouraging, concise. Use emojis sparingly.
Format: Short paragraphs. For disposal guidance use: "Item → Category → Location".
Answer ALL waste-related questions broadly.
If a question is completely unrelated to waste/environment/sustainability, politely redirect to eco topics.`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 })
  }

  const messages: any[] = body.messages ?? []
  const conversationId: string | null = body.conversationId ?? null

  // Extract last user message
  const lastMessage = messages[messages.length - 1]
  const lastUserContent: string =
    typeof lastMessage?.content === 'string'
      ? lastMessage.content
      : (lastMessage?.parts?.find((p: any) => p.type === 'text')?.text ?? '')

  // Extract image if present (base64 data URL)
  const imageData: string | null = body.imageData ?? null
  const imageMimeType: string = body.imageMimeType ?? 'image/jpeg'

  if (!lastUserContent.trim() && !imageData) {
    return new Response(JSON.stringify({ error: 'Empty message' }), { status: 400 })
  }

  const displayContent = lastUserContent || '📷 [Image uploaded]'

  // Save user message to Supabase (non-blocking)
  if (conversationId && lastMessage?.role === 'user') {
    supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: displayContent,
    }).then(() => {})
  }

  // Build history for Gemini (text only for history)
  const history = messages.slice(0, -1).map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{
      text: typeof m.content === 'string'
        ? m.content
        : (m.parts?.find((p: any) => p.type === 'text')?.text ?? '')
    }],
  })).filter((m: any) => m.parts[0].text.trim() !== '')

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! })

  // Build message parts — text + optional image
  const messageParts: any[] = []

  if (imageData) {
    // Strip data URL prefix to get raw base64
    const base64 = imageData.includes(',') ? imageData.split(',')[1] : imageData
    messageParts.push({
      inlineData: {
        mimeType: imageMimeType,
        data: base64,
      },
    })
  }

  if (lastUserContent.trim()) {
    messageParts.push({ text: lastUserContent })
  } else {
    messageParts.push({ text: 'What is this item and where should I dispose of it on campus?' })
  }

  // Try models in order of preference
  const MODELS = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-2.5-flash']
  let lastError: any = null

  for (const modelName of MODELS) {
    try {
      const chat = ai.chats.create({
        model: modelName,
        config: { systemInstruction: SYSTEM_PROMPT },
        history,
      })

      const geminiStream = await chat.sendMessageStream({ message: messageParts })

      const encoder = new TextEncoder()
      let fullText = ''

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of geminiStream) {
              const text = chunk.text ?? ''
              if (text) {
                fullText += text
                controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`))
              }
            }
            controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`))
            controller.close()

            if (conversationId && fullText) {
              await supabase.from('messages').insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: fullText,
              })
              await supabase
                .from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', conversationId)

              // Securely award eco points for classification or snap & sort
              try {
                if (imageData) {
                  await awardEcoPointsServer({
                    userId: user.id,
                    actionType: 'snap_and_sort',
                    description: 'Snap & Sort: Scanned item for campus disposal',
                  })
                } else {
                  await awardEcoPointsServer({
                    userId: user.id,
                    actionType: 'waste_classification',
                    description: 'Waste classification & disposal query',
                  })
                }
              } catch (ptsErr) {
                console.error('[chat] points award error:', ptsErr)
              }
            }
          } catch (streamErr) {
            console.error('[chat] stream error:', streamErr)
            controller.error(streamErr)
          }
        },
      })

      return new Response(readable, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Vercel-AI-Data-Stream': 'v1',
          'Cache-Control': 'no-cache',
        },
      })
    } catch (err: any) {
      console.error(`[chat] model ${modelName} failed:`, err?.message ?? err)
      lastError = err
      const status = err?.status ?? err?.code ?? 0
      if (status !== 503 && status !== 429) break
      await new Promise(r => setTimeout(r, 300))
    }
  }

  console.error('[chat] all models failed:', lastError)
  return new Response(
    JSON.stringify({ error: 'AI service temporarily unavailable. Please try again in a moment.', details: lastError?.message ?? String(lastError) }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  )
}
