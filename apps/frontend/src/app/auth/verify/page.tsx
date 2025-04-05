"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function VerifyPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const authenticate = async () => {
      const token = params?.get("token")
      const tokenType = params?.get("stytch_token_type")

      if (!token || !tokenType) {
        console.error("Missing token or token type")
        router.push("/auth")
        return
      }

      try {
        console.log("Authenticating with token:", token)
        const response = await fetch(
          `/api/auth/authenticate?token=${token}&stytch_token_type=${tokenType}`,
          {
            credentials: "include",
            headers: {
              Cookie: document.cookie
            }
          }
        )

        const result = await response.json()
        console.log("Authentication result:", result)

        if (!response.ok) {
          throw new Error(result.error || "Authentication failed")
        }

        // Log successful authentication
        console.log("Authentication successful, redirecting to /youtube")
        
        // Add a small delay before redirecting to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // If successful, redirect to youtube page
        router.push("/youtube")
      } catch (error) {
        console.error("Authentication error:", error)
        // If there's an error, redirect to login page
        router.push("/auth")
      }
    }

    authenticate()
  }, [params, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Authenticating...</h1>
        <p className="text-muted-foreground">Please wait while we verify your authentication.</p>
      </div>
    </div>
  )
}