// src/app/_components/ChatThread.tsx
'use client'
import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import { MessageRole, type ChatMessage, createMessageId } from "~/types/chat";
import { createConversationId, type Rating } from "~/types/branded";
import { RatingComponent } from "./RatingComponent";
import ReactMarkdown from 'react-markdown';
import { ConversationContext } from "~/lib/conversation-context";
import { type AIConversation } from "~/server/api/routers/aiConversations";

// Enhanced preprocessing function
const preprocessText = (text: string): string => {
	const numberedListRegex = /(\d+\.\s+.+?)(?=\s+\d+\.\s+|\s*$)/gs;
	let processedText = text.replace(numberedListRegex, '$1\n\n');
	processedText = processedText.replace(/(\•\s+[^\•\n]+)(?=\s+\•|\s*$)/g, '$1\n\n');
	processedText = processedText.replace(/(\-\s+[^\-\n]+)(?=\s+\-|\s*$)/g, '$1\n\n');
	return processedText;
};

export function ChatThread() {
	const [input, setInput] = useState<string>("");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Get conversation ID from localStorage
	const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(
		ConversationContext.getCurrentConversationId() ?? undefined
	);

	// Save conversation ID to localStorage whenever it changes
	useEffect(() => {
		if (currentConversationId) {
			ConversationContext.setConversationId(currentConversationId);
		}
	}, [currentConversationId]);

	// Fetch conversation data when ID changes
	useEffect(() => {
		if (!currentConversationId) return;

		const fetchConversation = async (): Promise<void> => {
			try {
				// Safely parse the conversationId to number
				const conversationIdNum = parseInt(currentConversationId, 10);
				if (isNaN(conversationIdNum)) {
					throw new Error("Invalid conversation ID");
				}

				// Use a manual fetch approach to avoid TRPC type issues
				// This is a workaround for the tRPC call pattern mismatch
				const response = await fetch(`/api/trpc/aiConversations.getById?batch=1&input={"0":{"id":${conversationIdNum}}}`);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const data = await response.json();

				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				if (data.result?.data?.json) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					const conversation = data.result.data.json as AIConversation;
					if (!conversation) return;

					// Create messages from the conversation data
					const conversationId = createConversationId(String(conversation.id));

					// User message
					const userMessage: ChatMessage = {
						id: createMessageId(crypto.randomUUID()),
						conversationId,
						role: MessageRole.User,
						content: conversation.prompt ?? "",
						timestamp: new Date(conversation.timestamp ?? Date.now())
					};

					// Assistant message
					const assistantMessage: ChatMessage = {
						id: createMessageId(crypto.randomUUID()),
						conversationId,
						role: MessageRole.Assistant,
						content: conversation.response ?? "",
						timestamp: new Date(conversation.timestamp ?? Date.now()),
						rating: conversation.rating as Rating
					};

					setMessages([userMessage, assistantMessage]);
				}
			} catch (error) {
				console.error("Failed to load conversation:", error);
			}
		};

		// Using void operator to explicitly mark promise as handled
		void fetchConversation();
	}, [currentConversationId]);

	// Add the rating mutation
	const updateRating = api.aiConversations.updateRating.useMutation({
		onSuccess: (response) => {
			// Using the returned AIConversation to update our UI
			const responseId = String(response.id);

			setMessages(prev => prev.map(msg =>
				msg.conversationId === createConversationId(responseId) &&
					msg.role === MessageRole.Assistant
					? { ...msg, rating: response.rating as Rating | null }
					: msg
			));
		}
	});

	// Add rating handler function
	const handleRatingChange = (conversationId: string, rating: number): void => {
		const parsedId = parseInt(conversationId, 10);
		if (isNaN(parsedId)) {
			console.error("Invalid conversation ID");
			return;
		}

		// Ensure rating is within bounds
		const boundedRating = Math.min(Math.max(rating, 0), 5) as Rating;

		updateRating.mutate({
			conversationId: parsedId,
			rating: boundedRating
		});
	};

	// TRPC mutation for sending messages to OpenAI
	const sendMessage = api.aiConversations.chatWithAI.useMutation({
		onSuccess: (response) => {
			// Save the conversation ID
			const responseId = String(response.id);
			setCurrentConversationId(responseId);

			// Add the user message first
			const userMessage: ChatMessage = {
				id: createMessageId(crypto.randomUUID()),
				conversationId: createConversationId(responseId),
				role: MessageRole.User,
				content: input,
				timestamp: new Date(),
			};

			// Add the assistant's response to the messages
			const assistantMessage: ChatMessage = {
				id: createMessageId(crypto.randomUUID()),
				conversationId: createConversationId(responseId),
				role: MessageRole.Assistant,
				content: response.response ?? "",
				timestamp: new Date(),
				rating: response.rating as Rating | null,
			};

			setMessages(prev => [...prev, userMessage, assistantMessage]);
			setIsLoading(false);
		},
		onError: (error) => {
			setMessages(prev => [...prev, {
				id: createMessageId(crypto.randomUUID()),
				conversationId: createConversationId("1"),
				role: MessageRole.Assistant,
				content: `Error: ${error.message}`,
				timestamp: new Date(),
				rating: null,
			}]);
			setIsLoading(false);
		}
	});

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = (): void => {
		if (!input.trim() || isLoading) return;

		// Note: We don't need to add the user message here anymore
		// as we'll add both messages when the API call succeeds
		setIsLoading(true);
		setInput("");

		// Send to OpenAI via our tRPC endpoint
		sendMessage.mutate({
			userId: "current-user",
			prompt: input,
			conversationId: currentConversationId,
			metadata: JSON.stringify({ source: "chat_interface" })
		});
	};

	// Add function to start a new conversation
	const handleNewConversation = (): void => {
		ConversationContext.clearConversationId();
		setCurrentConversationId(undefined);
		setMessages([]);
	};

	return (
		<div className="flex flex-col h-[600px] w-full max-w-4xl rounded-xl bg-louGray2/90 backdrop-blur-md overflow-hidden">
			{/* Chat header */}
			<div className="bg-louPrimary p-4 border-b border-white/20 flex justify-between items-center">
				<h2 className="text-xl font-bold">Ask Lou</h2>
				{currentConversationId && (
					<button
						onClick={handleNewConversation}
						className="bg-white/20 hover:bg-white/30 text-white text-sm rounded-md px-3 py-1"
					>
						New Conversation
					</button>
				)}
			</div>

			{/* Messages area */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.length === 0 ? (
					<div className="text-center py-10 text-white/60">
						Start a conversation with Lou...
					</div>
				) : (
					messages.map(message => (
						<div
							key={message.id}
							className={`flex flex-col ${message.role === MessageRole.User ? 'items-end' : 'items-start'}`}
						>
							<div
								className={`max-w-[80%] rounded-lg p-3 ${message.role === MessageRole.User
									? 'bg-louPrimary text-white'
									: 'bg-white/20 backdrop-blur-md text-white'
									}`}
							>
								{message.role === MessageRole.Assistant ? (
									<div className="prose prose-invert prose-sm max-w-none">
										<ReactMarkdown>
											{preprocessText(message.content)}
										</ReactMarkdown>
									</div>
								) : (
									message.content
								)}
							</div>

							{/* Add rating component only for assistant messages */}
							{message.role === MessageRole.Assistant && (
								<RatingComponent
									conversationId={message.conversationId}
									initialRating={message.rating ?? null}
									onRatingChange={handleRatingChange}
								/>
							)}
						</div>
					))
				)}
				{isLoading && (
					<div className="flex justify-start">
						<div className="bg-white/20 backdrop-blur-md text-white rounded-lg p-3">
							<div className="flex space-x-2">
								<div className="animate-bounce">●</div>
								<div className="animate-bounce delay-100">●</div>
								<div className="animate-bounce delay-200">●</div>
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input area */}
			<div className="p-4 border-t border-white/20 bg-louGray2/90">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSendMessage();
					}}
					className="flex gap-2"
				>
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type a message..."
						className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-louPrimary"
					/>
					<button
						type="submit"
						disabled={!input.trim() || isLoading}
						className="bg-louPrimary text-white rounded-full p-2 w-10 h-10 flex items-center justify-center disabled:opacity-50"
					>
						→
					</button>
				</form>
			</div>
		</div>
	);
}