import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { message: "Token is required" },
      { status: 400 }
    )
  }

  try {
    // Here you would verify the token with your authentication service
    // For now, we'll just simulate a successful verification
    const isValid = token.length > 0 // Replace with actual token verification

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { message: "Token verified successfully" },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to verify token" },
      { status: 500 }
    )
  }
}
