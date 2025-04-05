"use client";

import type { User } from "@shared/types";
import { useEffect, useState } from "react";

export default function Home() {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
			.then((res) => res.json())
			.then((data) => {
				setUser(data.user);
			});
	}, []);

	return (
		<main className="p-8 text-center">
			<h1 className="text-4xl font-bold text-blue-600">
				Frontend + Backend + Shared!
			</h1>
			{user ? (
				<p className="mt-4 text-xl">
					{" "}
					Hello, ({user.email})
				</p>
			) : (
				<p className="mt-4 text-gray-500">Loading user...</p>
			)}
		</main>
	);
}
