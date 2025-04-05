"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

export default function AuthenticatePage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const authenticate = async () => {
      const token = params?.get("token")
      const tokenType = params?.get("stytch_token_type")

      if (!token || !tokenType) {
        router.push("/auth")
        return
      }

      try {
        debugger
        const response = await fetch(
          `${API_BASE_URL}/auth/authenticate?token=${token}&stytch_token_type=${tokenType}`,
          {
            credentials: "include",
          }
        )

        if (!response.ok) {
          throw new Error("Authentication failed")
        }

        // If successful, redirect to home page
        router.push("/youtube")
      } catch (error) {
        console.error("Authentication error:", error)
        // If there's an error, redirect to login page
        router.push("/auth")
      }
    }

    authenticate()
  }, [router, params])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <p>Please wait while we verify your login.</p>
      </div>
    </div>
  )
}
