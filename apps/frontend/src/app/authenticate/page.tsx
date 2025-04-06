import { Suspense } from "react";
import AuthenticateContent from "./authenticate-content";

export default function AuthenticatePage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">Loading...</h1>
						<p>Please wait...</p>
					</div>
				</div>
			}
		>
			<AuthenticateContent />
		</Suspense>
	);
}
