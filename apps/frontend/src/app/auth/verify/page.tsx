"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          throw new Error("No token provided")
        }

        const response = await fetch(`/api/auth/verify?token=${token}`, {
          method: "GET",
        })

        if (!response.ok) {
          throw new Error("Invalid token")
        }

        // If successful, you might want to set some auth state here
        // For now, we'll just redirect to a success page
        router.push("/dashboard")
      } catch (error) {
        // If anything goes wrong, redirect back to the auth page
        router.push("/auth")
      }
    }

    verifyToken()
  }, [token, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-lg">Verifying your login...</p>
      </div>
    </div>
  )
}
