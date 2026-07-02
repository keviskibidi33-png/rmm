"use client"

import * as React from "react"
import { useRealTimeNotifications } from "@/lib/use-realtime"

export function RealTimeNotifier() {
  // Mount the websocket event hub notifications hook
  useRealTimeNotifications()
  return null
}
