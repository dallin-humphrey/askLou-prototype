// src/app/_components/aiConversations.tsx
"use client";

import { api } from "~/trpc/react";

export function AIConversationsDisplay() {
	const { data: conversations, isLoading, error } = api.aiConversations.getAll.useQuery();

	if (isLoading) return <div className="text-center py-4">Loading conversations...</div>;

	if (error) return <div className="text-center py-4 text-red-400">Error loading conversations: {error.message}</div>;

	if (!conversations || conversations.length === 0) {
		return <div className="text-center py-4">No conversations found.</div>;
	}

	// Display just the most recent 3 conversations
	const recentConversations = [...conversations].sort((a, b) =>
		new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	).slice(0, 3);

	return (
		<div className="space-y-4">
			{recentConversations.map((convo) => (
				<div key={convo.id} className="border border-white/20 rounded-lg p-4">
					<div className="flex justify-between mb-2">
						<span className="font-medium">User: {convo.userId}</span>
						<span className="text-sm opacity-70">
							{new Date(convo.timestamp).toLocaleString()}
						</span>
					</div>

					<div className="mb-3">
						<h3 className="text-sm font-semibold opacity-70">Prompt:</h3>
						<p className="p-2 bg-white/5 rounded">{convo.prompt}</p>
					</div>

					<div className="mb-3">
						<h3 className="text-sm font-semibold opacity-70">Response:</h3>
						<p className="p-2 bg-white/5 rounded">{convo.response}</p>
					</div>

					{convo.feedback && (
						<div className="mb-2">
							<h3 className="text-sm font-semibold opacity-70">Feedback:</h3>
							<p>{convo.feedback}</p>
						</div>
					)}

					{convo.rating !== null && (
						<div className="flex items-center">
							<span className="text-sm font-semibold opacity-70 mr-2">Rating:</span>
							<div className="flex">
								{[...Array(5)].map((_, i) => (
									<span key={i} className={i < convo.rating ? "text-yellow-400" : "text-gray-500"}>
										★
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
}