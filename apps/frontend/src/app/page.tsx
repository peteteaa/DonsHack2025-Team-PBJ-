"use client";

import type { User } from "@shared/types";
import { useEffect, useState } from "react";

export default function Home() {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		fetch("/api")
			.then((res) => {
				console.log(res);
				return res.json();
			})
			.then((data) => {
				console.log(data);
				setUser({
					id: "1",
					email: data.name,
				});
			});
	}, []);

	return (
		<main className="p-8 text-center">
			<h1 className="text-4xl font-bold text-blue-600">
				Frontend + Backend + Shared!
			</h1>
			{user ? (
				<p className="mt-4 text-xl"> Hello, ({user.email})</p>
			) : (
				<p className="mt-4 text-gray-500">Loading user...</p>
			)}
		</main>
	);
}
