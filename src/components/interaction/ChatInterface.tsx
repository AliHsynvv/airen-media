'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const send = () => {
    if (!input.trim()) return
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input }
    const reply: Message = { id: crypto.randomUUID(), role: 'assistant', content: 'Airen: Mesajını aldım! (Mock yanıt)' }
    setMessages(prev => [...prev, userMsg, reply])
    setInput('')
  }

  return (
    <Card className="glass-card p-4 h-[460px] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
        {messages.map(m => (
          <div key={m.id} className={`max-w-[80%] p-2 rounded-lg ${m.role === 'user' ? 'ml-auto bg-airen-blue text-white' : 'bg-white/10 text-gray-100'}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Airen’e yaz..." onKeyDown={e => e.key === 'Enter' && send()} />
        <Button onClick={send} variant="neon">Gönder</Button>
      </div>
    </Card>
  )
}


