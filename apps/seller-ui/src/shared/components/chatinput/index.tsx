"use client";

import React, { useState } from "react";
import { Send, ImageIcon, Smile } from "lucide-react";
import type { PickerProps } from "emoji-picker-react";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(
  () =>
    import("emoji-picker-react").then(
      (mod) => mod.default as React.FC<PickerProps>
    ),
  {
    ssr: false,
  }
);

const ChatInput = ({
  onSendMessage,
  message,
  setMessage,
}: {
  onSendMessage: (e: any) => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [showEmoji, setShowEmoji] = useState(false);

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  };

  return (
    <form
      onSubmit={onSendMessage}
      className="border-t border-t-[#dde1bc] bg-[#fffdf4] px-4 py-3 flex items-center gap-2 relative"
    >
      {/* Upload Icon */}
      <label className="cursor-pointer p-2 hover:bg-[#f7f8ea] rounded-md">
        <ImageIcon className="w-5 h-5 text-[#556244]" />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          hidden
        />
      </label>

      {/* Emoji Picker Toggle */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowEmoji((prev) => !prev)}
          className="p-2 hover:bg-[#f7f8ea] rounded-md"
        >
          <Smile className="w-5 h-5 text-[#556244]" />
        </button>
        {showEmoji && (
          <div className="absolute bottom-12 left-0 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 bg-white text-sm border outline-none border-[#dde1bc] rounded-md text-[#17320f]"
      />

      {/* Send Button */}
      <button
        type="submit"
        className="bg-[#86b81d] hover:bg-[#6a9317] transition text-white p-2 rounded-md"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default ChatInput;
