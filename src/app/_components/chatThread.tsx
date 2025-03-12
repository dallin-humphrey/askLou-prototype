// Update src/app/_components/ChatThread.tsx
'use client'
import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import { MessageRole, type ChatMessage, createMessageId } from "~/types/chat";
import { createConversationId, type Rating } from "~/types/branded";
import { RatingComponent } from "./RatingComponent"; // Import the new component
import ReactMarkdown from 'react-markdown'; // Add this import

// Enhanced preprocessing function with better regex and logging
const preprocessText = (text: string): string => {
	console.log("Original text:", text);

	// More robust regex that handles periods within the text
	const numberedListRegex = /(\d+\.\s+.+?)(?=\s+\d+\.\s+|\s*$)/gs;
	let processedText = text.replace(numberedListRegex, '$1\n\n');

	// Process bullet points if needed
	processedText = processedText.replace(/(\•\s+[^\•\n]+)(?=\s+\•|\s*$)/g, '$1\n\n');

	// Process dash lists
	processedText = processedText.replace(/(\-\s+[^\-\n]+)(?=\s+\-|\s*$)/g, '$1\n\n');

	console.log("Processed text:", processedText);
	console.log("Transformation summary:", text === processedText ?
		"No changes made" :
		"Text was reformatted for better markdown rendering");

	return processedText;
};

export function ChatThread() {
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);

	// Add the rating mutation
	const updateRating = api.aiConversations.updateRating.useMutation({
		onSuccess: (response) => {
			// Update the local messages state with the new rating
			setMessages(prev => prev.map(msg =>
				msg.conversationId === createConversationId(response.id.toString())
					? { ...msg, rating: response.rating as Rating | null }
					: msg
			));
		}
	});

	// Add rating handler function
	const handleRatingChange = (conversationId: string, rating: number) => {
		updateRating.mutate({
			conversationId: parseInt(conversationId),
			rating
		});
	};

	// TRPC mutation for sending messages to OpenAI
	const sendMessage = api.aiConversations.chatWithAI.useMutation({
		onSuccess: (response) => {
			console.log("Received AI response:", response.response);
			setCurrentConversationId(response.id.toString());
			// Add the assistant's response to the messages
			setMessages(prev => [...prev, {
				id: createMessageId(crypto.randomUUID()),
				conversationId: createConversationId(response.id.toString()),
				role: MessageRole.Assistant,
				content: response.response,
				timestamp: new Date(),
				rating: response.rating as Rating | null, // Include any existing rating
			}]);
			setIsLoading(false);
		},
		onError: (error) => {
			// Handle error
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

	const handleSendMessage = () => {
		if (!input.trim() || isLoading) return;

		console.log("Sending message:", input);

		// Add user message to the UI
		const userMessage: ChatMessage = {
			id: createMessageId(crypto.randomUUID()),
			conversationId: createConversationId("1"), // Temporary ID until we get response
			role: MessageRole.User,
			content: input,
			timestamp: new Date(),
		};

		setMessages(prev => [...prev, userMessage]);
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

	return (
		<div className="flex flex-col h-[600px] w-full max-w-4xl rounded-xl bg-louGray2/90 backdrop-blur-md overflow-hidden">
			{/* Chat header */}
			<div className="bg-louPrimary p-4 border-b border-white/20">
				<h2 className="text-xl font-bold">Ask Lou</h2>
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