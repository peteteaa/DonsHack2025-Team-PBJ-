import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const tokenType = searchParams.get("stytch_token_type");

  if (!token || !tokenType) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  try {
    debugger
    const response = await fetch(
      `${API_BASE_URL}/auth/authenticate?token=${token}&stytch_token_type=${tokenType}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      // If authentication fails, redirect to login page
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // If authentication succeeds, redirect to home page
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    // If there's an error, redirect to login page
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}
