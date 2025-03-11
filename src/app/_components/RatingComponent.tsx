// src/app/_components/RatingComponent.tsx
'use client'
import { useState } from "react";
import { type Rating } from "~/types/branded";

interface RatingComponentProps {
	conversationId: string;
	initialRating: Rating | null;
	onRatingChange: (conversationId: string, rating: number) => void;
}

export function RatingComponent({
	conversationId,
	initialRating,
	onRatingChange
}: RatingComponentProps) {
	const [rating, setRating] = useState<Rating | null>(initialRating);

	const handleRating = (newRating: number) => {
		const typedRating = newRating as Rating;
		setRating(typedRating);
		onRatingChange(conversationId, newRating);
	};

	return (
		<div className="flex items-center mt-1">
			<span className="text-sm mr-2 text-white/70">Rate:</span>
			<div className="flex">
				{Array.from({ length: 5 }, (_, i) => (
					<button
						key={i}
						onClick={() => handleRating(i + 1)}
						className="focus:outline-none px-1"
						aria-label={`Rate ${i + 1} stars`}
					>
						<span className={`text-lg ${i < (rating ?? 0) ? "text-yellow-400" : "text-white/50"}`}>
							★
						</span>
					</button>
				))}
			</div>
		</div>
	);
}