import Link from "next/link";
import { HydrateClient } from "~/trpc/server";
import { AIConversationsDisplay } from "~/app/_components/aiConversations";

export default async function ConversationsPage() {
	return (
		<HydrateClient>
			<main className="relative flex min-h-screen flex-col items-center bg-louGray1 text-white overflow-hidden">
				{/* Noise texture overlay */}
				<div className="absolute inset-0 bg-noise-texture opacity-30 mix-blend-overlay pointer-events-none"></div>

				<div className="container relative z-10 flex flex-col items-center gap-8 px-4 py-12">
					<div className="flex w-full justify-between items-center">
						<h1 className="text-3xl font-bold sm:text-4xl">All Conversations</h1>
						<Link
							href="/"
							className="bg-louBlack/30 hover:bg-louBlack/50 px-4 py-2 rounded-md transition-colors"
						>
							Back to Home
						</Link>
					</div>

					<div className="w-full max-w-6xl rounded-xl bg-white/10 p-6 backdrop-blur-sm">
						<AIConversationsDisplay showAll={true} />
					</div>

					<div className="w-full max-w-6xl mt-6">
						<Link
							className="inline-flex items-center bg-louPrimary px-6 py-3 rounded-md font-semibold text-white no-underline transition hover:bg-louPrimary/80"
							href="/conversations/new"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
							</svg>
							Start New Conversation
						</Link>
					</div>
				</div>
			</main>
		</HydrateClient>
	);
}