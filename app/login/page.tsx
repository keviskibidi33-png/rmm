"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Activity, Lock, User } from "lucide-react"
import { toast } from "sonner"
import { authenticate } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error("Complete todos los campos")
      return
    }

    setLoading(true)
    const success = await authenticate(username, password)
    setLoading(false)

    if (success) {
      toast.success("Welcome back, administrator.")
      router.push("/")
    } else {
      toast.error("Credenciales inválidas", {
        description: "El nombre de usuario o la contraseña son incorrectos.",
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4 text-stone-100 selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Activity className="size-6 animate-pulse" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">ApexRMM</h1>
          <p className="text-sm text-stone-400">Operations Console & Support Agent Portal</p>
        </div>

        <Card className="border border-stone-800 bg-stone-900/60 p-6 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                User profile
              </label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500" />
                <Input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-stone-950/50 pl-10 border-stone-800 text-stone-100 placeholder:text-stone-600 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Access Code / Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-stone-950/50 pl-10 border-stone-800 text-stone-100 placeholder:text-stone-600 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-primary hover:bg-primary/95 text-primary-foreground"
            >
              {loading ? "Authorizing..." : "Authenticate Session"}
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-xs text-stone-600">
          Secure endpoint orchestration portal. Authorized access only.
        </p>
      </div>
    </div>
  )
}
