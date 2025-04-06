"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { z } from "zod"


const emailSchema = z.object({
	email: z.string().email("Invalid email format"),
});

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const validationResult = emailSchema.safeParse({ email });
			if (!validationResult.success) {
				setError("Invalid email format");
				setIsLoading(false);
				return;
			}

      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Cookie: document.cookie
        },
        body: JSON.stringify({ email: validationResult.data.email }),
      })
      debugger

			if (!response.ok) {
				const contentType = response.headers.get("content-type");
				if (contentType?.includes("application/json")) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to send login link");
				}
				const errorText = await response.text();
				throw new Error(errorText || "Failed to send login link");
			}

			setIsSuccess(true);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to DonsFlow</CardTitle>
          <CardDescription>Enter your email to sign in or create an account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  disabled={isLoading || isSuccess}
                  required
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {isSuccess && (
              <Alert className="mt-4">
                <AlertDescription>Check your email for a login link!</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              type="submit"
              disabled={isLoading || isSuccess}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                "Continue with Email"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
