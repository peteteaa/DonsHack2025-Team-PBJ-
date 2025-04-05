"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"


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
        const response = await fetch(
          `/api/auth/authenticate?token=${token}&stytch_token_type=${tokenType}`,
          {
            credentials: "include",
            headers: {
              Cookie: document.cookie
            }
          }
        )

        if (!response.ok) {
          throw new Error("Authentication failed")
        }
        const data = await response.json()
        console.log
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
