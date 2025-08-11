// components/testimonios/StarRating.jsx
"use client";

import { useState } from "react";
import { Star, StarHalf } from "lucide-react";

const ratingLabels = {
  0: "Sin calificar",
  1: "Muy insatisfecho",
  2: "Insatisfecho",
  3: "Regular",
  4: "Satisfecho",
  5: "Muy satisfecho",
};

export function StarRating({ value, onChange }) {
  const [hoveredValue, setHoveredValue] = useState(0);

  const handleStarClick = (starValue) => {
    onChange(starValue);
  };

  const handleStarHover = (starValue) => {
    setHoveredValue(starValue);
  };

  const handleStarLeave = () => {
    setHoveredValue(0);
  };

  const displayValue = hoveredValue || value;

  return (
    <div className="space-y-2">
      <div className="flex justify-center items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleStarLeave}
            aria-label={`Calificar con ${star} estrella${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`w-8 h-8 transition-all duration-200 cursor-pointer ${
                star <= displayValue
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-muted-foreground hover:text-accent"
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {ratingLabels[displayValue]}
      </p>
    </div>
  );
}