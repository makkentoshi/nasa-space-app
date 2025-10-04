 'use client'
import { PageHeader } from '@/components/ui/PageHeader';
import { MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'

type Msg = { id: string; text: string; ts: number }

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Msg[]>([])
  const [isSending, setIsSending] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  // load saved messages on mount (client-only)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('local-chat')
        if (raw) setMessages(JSON.parse(raw))
      }
    } catch (e: any) {
      setLoadError('Failed to load local chat')
    }
  }, [])

  // persist messages when they change (client-only)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('local-chat', JSON.stringify(messages))
      }
    } catch (e: any) {
      setLoadError('Failed to persist local chat')
    }
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  const send = () => {
    if (!text.trim()) return
  setIsSending(true)
  setMessages(prev => [...prev, { id: String(Date.now()), text: text.trim(), ts: Date.now() }])
  setText('')
  setTimeout(() => setIsSending(false), 300)
  }

  const shareLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported')
    setIsSending(true)
    navigator.geolocation.getCurrentPosition((pos) => {
      const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`
      setMessages(prev => [...prev, { id: String(Date.now()), text: `My location: ${url}`, ts: Date.now() }])
      setIsSending(false)
    }, (err) => {
      alert('Location error: ' + err?.message)
      setIsSending(false)
    })
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-pwa-bg1 dark:bg-darkbg pb-12">
        <div className="max-w-3xl mx-auto px-4 relative">
          <div className="mb-3 relative">
            <BackButton onClick={() => router.back()} />
            <PageHeader
                title="Community Chat"
                subtitle="Local chat for your area — share status, locations and help each other."
                icon={<MessageCircle className="h-12 w-12 text-[#53B175]" />}
                bgColor="#FCFCFC"
                textColor="#37393F"
              />
            </div>

          <div ref={listRef} className="bg-white rounded-xl p-4 h-96 overflow-auto shadow-sm">
          {loadError && <div className="text-sm text-red-600">{loadError}</div>}
          {messages.length === 0 && !loadError && <div className="text-sm text-muted-foreground">No messages yet. Share updates for your area.</div>}
          {messages.map(m => (
            <div key={m.id} className="mb-3">
              <div className="text-sm bg-gray-100 p-2 rounded">{m.text}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(m.ts).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 mb-2">
            <button className="px-3 py-2 rounded bg-[#53B175] text-white text-sm" onClick={() => setText('Please share short safety videos')}>Video files</button>
            <button className="px-3 py-2 rounded bg-gray-200 text-sm" onClick={() => setText('Share instructions for evacuation')}>Instructions</button>
          </div>
          <div className="flex gap-2 w-full items-center">
            <input className="flex-1 min-w-0 p-3 rounded-xl border" value={text} onChange={e => setText(e.target.value)} placeholder="Message your neighbours" disabled={isSending} />
            <button className="px-4 py-2 rounded-xl bg-[#53B175] text-white" onClick={send} disabled={isSending}>{isSending ? 'Sending...' : 'Send'}</button>
            <button className="px-3 py-2 rounded-xl bg-[#2196F3] text-white" onClick={shareLocation} disabled={isSending}>{isSending ? 'Sharing...' : 'Share location'}</button>
          </div>
        </div>
      </div>
    </div>
    </AppShell>
  )
}