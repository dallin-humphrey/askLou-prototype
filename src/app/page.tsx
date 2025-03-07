import Link from "next/link";
import { HydrateClient } from "~/trpc/server";
import { AIConversationsDisplay } from "~/app/_components/aiConversations";

export default async function Home() {
	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
						Ask <span className="text-[hsl(280,100%,70%)]">Lou</span> Prototype
					</h1>

					<div className="w-full max-w-4xl rounded-xl bg-white/10 p-6">
						<h2 className="mb-4 text-2xl font-bold">Recent AI Conversations</h2>
						<AIConversationsDisplay />
					</div>

					<div className="flex justify-center">
						<Link
							className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
							href="/conversations"
						>
							View All Conversations
						</Link>
					</div>
				</div>
			</main>
		</HydrateClient>
	);
}