import Link from "next/link";
import Image from "next/image";
import { HydrateClient } from "~/trpc/server";
import { ChatThread } from "./_components/chatThread";

export default async function Home() {
	return (
		<HydrateClient>
			{/* <header className="bg-wood-grain-simple h-56">

			</header> */}
			<main className="relative flex min-h-screen flex-col items-center justify-center bg-louGray1 text-white overflow-hidden">
				{/* Noise texture overlay - ONLY for the page background */}
				<div className="absolute inset-0 bg-noise-texture opacity-30 mix-blend-overlay pointer-events-none"></div>

				<div className="container relative z-10 flex flex-col items-center justify-center gap-12 px-4 py-16">
					<div className="flex items-center gap-6 bg-louGray1/80 backdrop-blur-sm p-4 rounded-xl">
						<div className="relative w-24 h-24 sm:w-32 sm:h-32">
							<Image
								src="/lou.png"
								alt="Lou"
								width={400}
								height={400}
								className="object-cover"
								priority
							/>
						</div>
						<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
							Ask <span className="text-louPrimary">Lou</span> Prototype
						</h1>
					</div>

					{/* Ensure ChatThread has proper background */}
					<div className="w-full max-w-4xl bg-louGray1/90 backdrop-blur-md rounded-xl overflow-hidden">
						<ChatThread />
					</div>

					<div className="flex justify-center bg-louGray1/80 backdrop-blur-sm p-2 rounded-xl">
						<Link
							className="rounded-full bg-louPrimary px-10 py-3 font-semibold text-white no-underline transition hover:bg-louPrimary/80"
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