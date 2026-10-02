'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Camera, Image as ImageIcon, Leaf, Paperclip, Recycle, SendHorizontal, Sparkles, MapPin, Battery, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { triggerPointCelebration } from '@/components/rewards/point-celebration-toast'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string // preview URL for display
}

type User = { id: string; email: string; displayName: string | null; avatarUrl: string | null }
type Conversation = { id: string; title: string | null; created_at: string; updated_at: string }

type Props = {
  user: User
  conversationId: string | null
  onNewConversation: (conv: Conversation) => void
  onTitleUpdate: (id: string, title: string) => void
  initialPrompt?: string
}

const STARTER_PROMPTS = [
  { icon: Recycle,   text: 'Where do I recycle plastic bottles?' },
  { icon: Battery,   text: 'How to dispose of old batteries?' },
  { icon: MapPin,    text: 'Where is the nearest recycling bin?' },
  { icon: Sparkles,  text: 'Give me 3 eco tips for hostel life' },
  { icon: ImageIcon, text: '📷 Take a photo of waste to identify it' },
]

function genId() { return Math.random().toString(36).slice(2) }

function compressImage(file: File, maxWidth = 800): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        const base64 = canvas.toDataURL('image/jpeg', 0.85)
        resolve({ base64, mimeType: 'image/jpeg' })
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ChatPanel({ user, conversationId, onNewConversation, onTitleUpdate, initialPrompt }: Props) {
  const [activeConvId, setActiveConvId] = useState<string | null>(conversationId)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const activeConvIdRef = useRef<string | null>(conversationId)
  const titleSetRef = useRef<Set<string>>(new Set())
  const didSendInitialRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { activeConvIdRef.current = activeConvId }, [activeConvId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    setActiveConvId(conversationId)
    activeConvIdRef.current = conversationId
    setInputValue('')
    setSelectedImage(null)
    didSendInitialRef.current = false
    if (!conversationId) { setMessages([]); return }
    const supabase = createClient()
    supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data.map((m) => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content })))
      })
  }, [conversationId])

  useEffect(() => {
    if (initialPrompt && !didSendInitialRef.current && messages.length === 0 && !isLoading) {
      didSendInitialRef.current = true
      if (initialPrompt === '📷 Take a photo of waste to identify it') {
        fileInputRef.current?.click()
      } else {
        void handleSend(initialPrompt)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt])

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { base64, mimeType } = await compressImage(file)
      setSelectedImage({ base64, mimeType, previewUrl: base64 })
    } catch (err) {
      console.error('Image processing error:', err)
    }
    // Reset input so same file can be picked again
    e.target.value = ''
  }

  function clearImage() {
    setSelectedImage(null)
  }

  async function createConversationIfNeeded(): Promise<string | null> {
    if (activeConvIdRef.current) return activeConvIdRef.current
    const supabase = createClient()
    const { data } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title: null })
      .select()
      .single()
    if (data) {
      setActiveConvId(data.id)
      activeConvIdRef.current = data.id
      onNewConversation(data)
      return data.id
    }
    return null
  }

  async function handleSend(text: string, imageOverride?: typeof selectedImage) {
    const img = imageOverride ?? selectedImage
    if (!text.trim() && !img) return
    if (isLoading) return

    const convId = await createConversationIfNeeded()
    setInputValue('')
    setSelectedImage(null)

    const userMsg: Message = {
      id: genId(),
      role: 'user',
      content: text || '📷 What is this item and how should I dispose of it?',
      imageUrl: img?.previewUrl,
    }
    const allMessages = [...messages, userMsg]
    setMessages(allMessages)
    setIsLoading(true)

    const assistantId = genId()
    setMessages([...allMessages, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          conversationId: convId,
          imageData: img?.base64 ?? null,
          imageMimeType: img?.mimeType ?? 'image/jpeg',
        }),
      })

      if (!res.ok) {
        let errMsg = `HTTP ${res.status}`
        try {
          const errData = await res.json()
          errMsg = errData.error ?? errData.details ?? errMsg
        } catch {
          errMsg = await res.text().catch(() => errMsg)
        }
        throw new Error(errMsg)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(Boolean)
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const parsed = JSON.parse(line.slice(2))
                fullText += parsed
                setMessages((prev) =>
                  prev.map((m) => m.id === assistantId ? { ...m, content: fullText } : m)
                )
              } catch {}
            }
          }
        }
      }

      if (fullText) {
        triggerPointCelebration({
          points: 5,
          actionTitle: img ? 'Snap & Sort' : 'Waste Classification',
        })
      }

      // Auto-generate conversation title
      if (convId && !titleSetRef.current.has(convId) && allMessages.length === 1) {
        titleSetRef.current.add(convId)
        const title = (text || 'Image — waste identification').slice(0, 60).trim()
        const supabase = createClient()
        await supabase.from('conversations').update({ title }).eq('id', convId)
        onTitleUpdate(convId, title)
      }
    } catch (err) {
      console.error('[chat] error:', err)
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, content: `⚠️ ${msg}` } : m)
      )
    } finally {
      setIsLoading(false)
    }
  }

  const initials = user.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase()

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-full flex-col">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
        aria-label="Upload image from files"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageSelect}
        aria-label="Take photo with camera"
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="space-y-2">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/15 shadow-[0_0_30px_-10px_oklch(0.76_0.165_158/0.5)]">
                <Leaf className="size-7 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold">Hi {user.displayName?.split(' ')[0] ?? 'there'} 👋</h2>
              <p className="max-w-xs text-sm text-muted-foreground">
                Ask me anything or <span className="text-primary font-medium">upload a photo</span> of waste to identify it instantly.
              </p>
            </div>
            <div className="grid w-full max-w-sm grid-cols-1 gap-2 sm:grid-cols-2">
              {STARTER_PROMPTS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => {
                    if (text === '📷 Take a photo of waste to identify it') {
                      fileInputRef.current?.click()
                    } else {
                      handleSend(text)
                    }
                  }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border border-border bg-card/60 px-3.5 py-3 text-left text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground',
                    text.startsWith('📷') && 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10',
                  )}
                >
                  <Icon className="size-4 shrink-0 text-primary" />
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex gap-2.5', message.role === 'user' ? 'justify-end' : 'justify-start items-end')}
              >
                {message.role === 'assistant' && (
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.13_170)] text-primary-foreground">
                    <Bot className="size-4" />
                  </span>
                )}

                <div className={cn(
                  'max-w-[80%] rounded-2xl text-sm leading-relaxed overflow-hidden',
                  message.role === 'user'
                    ? 'rounded-br-md bg-primary text-primary-foreground'
                    : 'rounded-bl-md border border-border bg-card/70',
                )}>
                  {/* Image preview in message */}
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Uploaded waste"
                      className="w-full max-h-60 object-cover rounded-t-2xl"
                    />
                  )}
                  <div className="px-4 py-2.5">
                    {message.content === '' && message.role === 'assistant'
                      ? <span className="flex gap-1 py-1">{[0, 150, 300].map(d => <span key={d} className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${d}ms` }} />)}</span>
                      : message.content.split('\n').map((line, i) => <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>)
                    }
                  </div>
                </div>

                {message.role === 'user' && (
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                    {user.avatarUrl ? <img src={user.avatarUrl} alt={initials} className="size-8 rounded-full object-cover" /> : initials}
                  </span>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Image preview strip above input */}
      {selectedImage && (
        <div className="border-t border-border bg-background/50 px-4 py-2">
          <div className="mx-auto max-w-2xl">
            <div className="relative inline-block">
              <img
                src={selectedImage.previewUrl}
                alt="Selected waste"
                className="h-20 w-20 rounded-xl object-cover border border-border"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-destructive text-white shadow-sm"
                aria-label="Remove image"
              >
                <X className="size-3" />
              </button>
              <div className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                Ready to send
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border p-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-background/50 py-2 pl-3 pr-2">

            {/* Attachment buttons */}
            <div className="flex shrink-0 gap-1 pb-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Upload image from files"
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary disabled:opacity-40"
                aria-label="Upload image"
              >
                <Paperclip className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isLoading}
                title="Take photo with camera"
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary disabled:opacity-40"
                aria-label="Take photo"
              >
                <Camera className="size-4" />
              </button>
            </div>

            <div className="w-px self-stretch bg-border" aria-hidden="true" />

            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(inputValue)
                }
              }}
              placeholder={selectedImage ? 'Add a message or send image as-is…' : 'Ask about any waste item or upload a photo…'}
              rows={1}
              disabled={isLoading}
              className="max-h-32 min-h-[1.5rem] flex-1 resize-none bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-60"
              aria-label="Message Eco Bot"
            />

            <button
              type="button"
              onClick={() => handleSend(inputValue)}
              disabled={isLoading || (!inputValue.trim() && !selectedImage)}
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-xl transition-all duration-200',
                (inputValue.trim() || selectedImage) && !isLoading
                  ? 'bg-primary text-primary-foreground hover:brightness-110'
                  : 'bg-white/5 text-muted-foreground',
              )}
              aria-label="Send"
            >
              <SendHorizontal className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground/50">
            📷 Upload a photo · Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
