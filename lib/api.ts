/**
 * lib/api.ts
 * Client-side helpers to consume the Go backend REST API.
 * All functions are async and return typed data.
 */

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080"

// ─── Types returned by the backend ───────────────────────────────────────────

export type AgentStatus = "online" | "offline"

export type AgentInfo = {
  id: string
  hostname: string
  os: string
  cpuModel: string
  cpuLoad: number
  totalRam: number
  freeRam: number
  diskTotal: number
  diskFree: number
  status: AgentStatus
  lastSeen: string
}

export type AlertRow = {
  id: number
  agentId: string
  severity: "critical" | "warning" | "info"
  message: string
  time: string
}

export type TelemetryRow = {
  cpuLoad: number
  totalRam: number
  freeRam: number
  diskTotal: number
  diskFree: number
  recordedAt: string
}

export type BackupJob = {
  id: number
  agentId: string
  name: string
  location: string
  type: "full" | "incremental"
  status: "completed" | "running" | "failed" | "pending"
  sizeBytes: number
  cron: string
  executedAt: string
  createdAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : ""
  const headers: Record<string, string> = {
    Accept: "application/json",
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${BACKEND}${path}`, {
    cache: "no-store",
    headers,
  })
  if (!res.ok) throw new Error(`API ${path} responded with ${res.status}`)
  return res.json() as Promise<T>
}

/** Authenticates against Go Backend and saves token in localStorage. */
export async function authenticate(username: string, password: string): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) return false
    const data = await res.json()
    if (data.token) {
      localStorage.setItem("token", data.token)
      // Save token in cookies to allow middleware access
      document.cookie = `token=${data.token}; path=/; max-age=86400;`
      return true
    }
    return false
  } catch {
    return false
  }
}

/** Logs out technician by clearing cookies and storage. */
export function logout() {
  localStorage.removeItem("token")
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
}


// ─── API Functions ────────────────────────────────────────────────────────────

/** Returns all agents with their latest telemetry snapshot. */
export async function fetchAgents(): Promise<AgentInfo[]> {
  try {
    return await get<AgentInfo[]>("/api/agents")
  } catch {
    return []
  }
}

/** Returns the last 100 telemetry rows for a given agent. */
export async function fetchAgentTelemetry(id: string): Promise<TelemetryRow[]> {
  try {
    return await get<TelemetryRow[]>(`/api/agents/telemetry?id=${encodeURIComponent(id)}`)
  } catch {
    return []
  }
}

/** Returns the 50 most recent alerts across all agents. */
export async function fetchAlerts(): Promise<AlertRow[]> {
  try {
    return await get<AlertRow[]>("/api/alerts")
  } catch {
    return []
  }
}

/** Returns all backup jobs from the DB. */
export async function fetchBackups(): Promise<BackupJob[]> {
  try {
    return await get<BackupJob[]>("/api/backups")
  } catch {
    return []
  }
}

/** Triggers a manual backup for the given agentId. */
export async function runBackup(agentId: string): Promise<void> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : ""
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    await fetch(`${BACKEND}/api/backups/run`, {
      method: "POST",
      headers,
      body: JSON.stringify({ agentId }),
    })
  } catch {
    // silently ignore
  }
}
