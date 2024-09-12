import React from "react";
import { Twitter, Heart, MessageCircle, Repeat, Share } from "lucide-react";

interface TwitterMockProps {
  content: string[];
}

export const TwitterMock: React.FC<TwitterMockProps> = ({ content }) => {
  return (
    <div className="bg-white text-black rounded-lg p-4 max-w-md mx-auto">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
        <div>
          <p className="font-bold">Your Name</p>
          <p className="text-gray-500">@yourhandle</p>
        </div>
      </div>
      {content.map((tweet, index) => (
        <div key={index} className="mb-4 border-b border-gray-200 pb-4">
          <p>{tweet}</p>
          <div className="flex justify-between mt-3 text-gray-500">
            <MessageCircle size={18} />
            <Repeat size={18} />
            <Heart size={18} />
            <Share size={18} />
          </div>
        </div>
      ))}
    </div>
  );
};
