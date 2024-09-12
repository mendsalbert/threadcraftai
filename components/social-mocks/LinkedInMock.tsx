import React from "react";
import { ThumbsUp, MessageSquare, Repeat, Send } from "lucide-react";

interface LinkedInMockProps {
  content: string;
}

export const LinkedInMock: React.FC<LinkedInMockProps> = ({ content }) => {
  return (
    <div className="bg-white text-black rounded-lg p-4 max-w-md mx-auto">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
        <div>
          <p className="font-bold">Your Name</p>
          <p className="text-gray-500 text-sm">Your Title • 1st</p>
        </div>
      </div>
      <p className="mb-4">{content}</p>
      <div className="flex justify-between text-gray-500">
        <ThumbsUp size={18} />
        <MessageSquare size={18} />
        <Repeat size={18} />
        <Send size={18} />
      </div>
    </div>
  );
};
