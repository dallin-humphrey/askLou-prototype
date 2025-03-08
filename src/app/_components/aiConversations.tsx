// src/app/_components/aiConversations.tsx
"use client";

import { useCallback, useMemo } from "react";
import { api } from "~/trpc/react";
import { type AIConversation } from "~/types/conversations";
import { createConversationId, createTimestamp, createUserId, type Rating } from "~/types/branded";

type ConversationDisplayProps = {
	conversation: AIConversation;
};

// Helper for safely converting API ratings to our Rating type
const safeRating = (rating: number | null): Rating | null => {
	if (rating === null) return null;
	// Ensure it's within our Rating type range
	return Math.min(Math.max(Math.floor(rating), 0), 5) as Rating;
};

/**
 * Component for displaying a single conversation
 */
const ConversationDisplay = ({ conversation }: ConversationDisplayProps) => {
	return (
		<div className="border border-white/20 rounded-lg p-4">
			<div className="flex justify-between mb-2">
				<span className="font-medium">User: {conversation.userId}</span>
				<span className="text-sm opacity-70">
					{conversation.timestamp.toLocaleString()}
				</span>
			</div>

			<div className="mb-3">
				<h3 className="text-sm font-semibold opacity-70">Prompt:</h3>
				<p className="p-2 bg-white/5 rounded">{conversation.prompt}</p>
			</div>

			<div className="mb-3">
				<h3 className="text-sm font-semibold opacity-70">Response:</h3>
				<p className="p-2 bg-white/5 rounded">{conversation.response}</p>
			</div>

			{conversation.feedback && (
				<div className="mb-2">
					<h3 className="text-sm font-semibold opacity-70">Feedback:</h3>
					<p>{conversation.feedback}</p>
				</div>
			)}
			{conversation.rating !== null && (
				<div className="flex items-center">
					<span className="text-sm font-semibold opacity-70 mr-2">Rating:</span>
					<div className="flex">
						{Array.from({ length: 5 }, (_, i) => (
							<span
								key={i}
								className={i < conversation.rating! ? "text-yellow-400" : "text-gray-500"}
							>
								★
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

/**
 * Component for displaying all conversations
 */
export function AIConversationsDisplay() {
	const {
		data: rawConversations,
		isLoading,
		error
	} = api.aiConversations.getAll.useQuery();

	// Transform raw data into properly typed data
	const conversations = useMemo(() => {
		if (!rawConversations) return undefined;

		return rawConversations.map(convo => {
			// Handle each property explicitly with proper type conversion
			return {
				id: createConversationId(String(convo.id)),
				userId: createUserId(convo.userId),
				timestamp: createTimestamp(convo.timestamp ?? new Date()),
				prompt: convo.prompt,
				response: convo.response,
				feedback: convo.feedback,
				rating: safeRating(convo.rating)
			} satisfies AIConversation;
		});
	}, [rawConversations]);

	// Type guard to ensure we have conversations
	const hasConversations = (
		convos: AIConversation[] | undefined
	): convos is AIConversation[] => {
		return !!convos && convos.length > 0;
	};

	const sortConversations = useCallback((a: AIConversation, b: AIConversation) => {
		return b.timestamp.getTime() - a.timestamp.getTime();
	}, []);

	// Use useMemo for the sorted conversations to avoid unnecessary re-sorting
	const recentConversations = useMemo(() => {
		if (!hasConversations(conversations)) return [];
		return [...conversations].sort(sortConversations).slice(0, 3);
	}, [conversations, sortConversations]);

	if (isLoading) return <div className="text-center py-4">Loading conversations...</div>;

	if (error) return (
		<div className="text-center py-4 text-red-400">
			Error loading conversations: {error.message}
		</div>
	);

	if (!hasConversations(conversations)) {
		return <div className="text-center py-4">No conversations found.</div>;
	}

	return (
		<div className="space-y-4">
			{recentConversations.map((convo) => (
				<ConversationDisplay key={convo.id} conversation={convo} />
			))}
		</div>
	);
}