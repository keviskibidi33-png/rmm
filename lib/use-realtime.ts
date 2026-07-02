"use client"

import * as React from "react"
import { toast } from "sonner"

export function useRealTimeNotifications() {
  React.useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    function connect() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : ""
      if (!token) return

      // Connect to event hub socket on backend
      const wsUrl = `ws://localhost:8080/api/events/ws?token=${encodeURIComponent(token)}`
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log("WebSocket Event Hub connected.")
      }

      ws.onmessage = (event) => {
        try {
          const alert = JSON.parse(event.data)
          // Trigger dynamic Sonner toast notification
          if (alert.type === "critical") {
            toast.error(`CRITICAL: ${alert.message}`, {
              description: `Agent: ${alert.agentId} | Click to open incident details.`,
              duration: 8000,
            })
          } else if (alert.type === "warning") {
            toast.warning(`WARNING: ${alert.message}`, {
              description: `Agent: ${alert.agentId}`,
              duration: 6000,
            })
          } else {
            toast.info(alert.message, {
              description: `Agent: ${alert.agentId}`,
              duration: 4000,
            })
          }
        } catch (err) {
          console.error("Failed to parse Event Hub message:", err)
        }
      }

      ws.onclose = () => {
        console.log("WebSocket Event Hub disconnected. Retrying in 5s...")
        reconnectTimeout = setTimeout(connect, 5000)
      }

      ws.onerror = () => {
        ws?.close()
      }
    }

    connect()

    return () => {
      if (ws) ws.close()
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
    }
  }, [])
}
