// src/app/_components/ChatThread.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import { MessageRole, type ChatMessage, createMessageId } from "~/types/chat";
import { createConversationId, createUserId } from "~/types/branded";

export function ChatThread() {
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// TRPC mutation for sending messages
	const sendMessage = api.chat.sendMessage.useMutation({
		onSuccess: (response) => {
			// Add the assistant's response to the messages
			setMessages(prev => [...prev, {
				id: createMessageId(crypto.randomUUID()),
				conversationId: createConversationId("1"), // You'd use the actual conversation ID
				role: MessageRole.Assistant,
				content: response.text,
				timestamp: new Date(),
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

		// Add user message to the UI
		const userMessage: ChatMessage = {
			id: createMessageId(crypto.randomUUID()),
			conversationId: createConversationId("1"), // You'd use the actual conversation ID
			role: MessageRole.User,
			content: input,
			timestamp: new Date(),
		};

		setMessages(prev => [...prev, userMessage]);
		setIsLoading(true);
		setInput("");

		// Send to backend
		sendMessage.mutate({ message: input });
	};

	return (
		<div className="flex flex-col h-[600px] w-full max-w-4xl rounded-xl bg-white/10 backdrop-blur-sm overflow-hidden">
			{/* Chat header */}
			<div className="bg-louPrimary/30 p-4 border-b border-white/20">
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
							className={`flex ${message.role === MessageRole.User ? 'justify-end' : 'justify-start'}`}
						>
							<div
								className={`max-w-[80%] rounded-lg p-3 ${message.role === MessageRole.User
									? 'bg-louPrimary text-white'
									: 'bg-white/20 text-white'
									}`}
							>
								{message.content}
							</div>
						</div>
					))
				)}
				{isLoading && (
					<div className="flex justify-start">
						<div className="bg-white/20 text-white rounded-lg p-3">
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
			<div className="p-4 border-t border-white/20">
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