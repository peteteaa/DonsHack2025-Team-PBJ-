"use client";

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
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [user, setUser] = useState<{ email: string } | null>(null);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/auth/status", {
					credentials: "include",
					headers: {
						Cookie: document.cookie,
					},
				});

				if (!response.ok) {
					throw new Error("Failed to fetch user status");
				}

				const data = await response.json();
				if (!data.authenticated) {
					router.push("/auth");
					return;
				}

				setUser({ email: data.email });
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, [router]);

	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
				headers: {
					Cookie: document.cookie,
				},
			});
			router.push("/auth");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to logout");
		}
	};

	const handleStart = () => {
		router.push("/youtube");
	}

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Welcome to DonsFlow</CardTitle>
					<CardDescription>You are logged in as {user?.email}</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<Button className="w-full" onClick={handleStart}>
						Let's get started
					</Button>
				</CardContent>
				<CardFooter>
					<Button className="w-full" onClick={handleLogout}>
						Logout
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
