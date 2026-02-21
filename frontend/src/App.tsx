import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"

type Message = {
  role: "user" | "assistant"
  content: string
  model_used?: string
}

type ChatResponse = {
  session_id: string
  reply: string
  model_used: string
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("session_id")
    if (stored) setSessionId(stored)
  }, [])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await axios.post<ChatResponse>(
        "http://localhost:3000/chat",
        {
          session_id: sessionId,
          message: input,
        }
      )

      const { reply, session_id, model_used } = response.data

      if (!sessionId) {
        localStorage.setItem("session_id", session_id)
        setSessionId(session_id)
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          model_used,
        },
      ])
    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col p-4">
        <h2 className="text-xl font-semibold mb-4">
          Adaptive AI Router
        </h2>

        <ScrollArea className="flex-1 pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.role === "assistant" && (
                    <p className="text-xs mt-1 opacity-70">
                      {msg.model_used}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage()
            }}
          />
          <Button onClick={sendMessage} disabled={loading}>
            {loading ? "..." : "Send"}
          </Button>
        </div>
      </Card>
    </div>
  )
}