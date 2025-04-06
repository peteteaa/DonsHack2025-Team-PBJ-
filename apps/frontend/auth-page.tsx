"use client";

import type React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AuthPage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to send login link");
			}

			const data = await response.json();
			setIsSuccess(true);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to send login link. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const isValidEmail = (email: string) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">Sign in</CardTitle>
					<CardDescription>
						Enter your email to receive a magic link
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent>
						{error && (
							<Alert className="mb-4" variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{isSuccess ? (
							<Alert className="mb-4">
								<AlertDescription>
									Check your email! We sent you a magic link to sign in.
								</AlertDescription>
							</Alert>
						) : (
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@example.com"
										required
										type="email"
										value={email}
									/>
								</div>
							</div>
						)}
					</CardContent>

					{!isSuccess && (
						<CardFooter>
							<Button
								className="w-full"
								disabled={isLoading || !isValidEmail(email)}
								type="submit"
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Sending...
									</>
								) : (
									"Send Magic Link"
								)}
							</Button>
						</CardFooter>
					)}
				</form>
			</Card>
		</div>
	);
}
