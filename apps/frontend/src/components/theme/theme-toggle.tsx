"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
	const { setTheme, theme } = useTheme();

	return (
		<Button
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			size="icon"
			variant="ghost"
		>
			{theme === "light" ? (
				<Moon className="h-[1.2rem] w-[1.2rem]" />
			) : (
				<Sun className="h-[1.2rem] w-[1.2rem]" />
			)}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
