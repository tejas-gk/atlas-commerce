"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

import useSeller from "@/hooks/useSeller";
import { useWebSocket } from "@/context/web-socket-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import ChatInput from "@/shared/components/chatinput";
import { Badge } from "@workspace/ui/components/badge";

const ChatPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const { seller, isLoading: userLoading } = useSeller();
  const conversationId = searchParams.get("conversationId");
  const queryClient = useQueryClient();
  const { ws } = useWebSocket();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      const res = await axiosInstance.get(
        `/chatting/api/get-seller-messages/${conversationId}?page=1`
      );
      setHasFetchedOnce(true);
      return res.data.messages.reverse();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;
    const timeout = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeout);
  }, [conversationId, messages.length]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const container = messageContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 50);
    });
  };

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/chatting/api/get-seller-conversations"
      );
      return res.data.conversations;
    },
  });

  useEffect(() => {
    if (conversations) setChats(conversations);
  }, [conversations]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event: any) => {
      const data = JSON.parse(event.data);

      if (data.type === "NEW_MESSAGE") {
        const newMsg = data?.payload;

        if (newMsg.conversationId === conversationId) {
          queryClient.setQueryData(
            ["messages", conversationId],
            (old: any = []) => [
              ...old,
              {
                content: newMsg.messageBody || newMsg.content || "",
                senderType: newMsg.senderType,
                seen: false,
                createdAt: newMsg.createdAt || new Date().toISOString(),
              },
            ]
          );
          scrollToBottom();
        }

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.conversationId === newMsg.conversationId
              ? { ...chat, lastMessage: newMsg.content }
              : chat
          )
        );
      }

      if (data.type === "UNSEEN_COUNT_UPDATE") {
        const { conversationId, count } = data.payload;
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.conversationId === conversationId
              ? { ...chat, unreadCount: count }
              : chat
          )
        );
      }
    };
  }, [ws, conversationId]);

  const handleChatSelect = (chat: any) => {
    setHasFetchedOnce(false);
    setChats((prev) =>
      prev.map((c) =>
        c.conversationId === chat.conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
    router.push(`?conversationId=${chat.conversationId}`);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "MARK_AS_SEEN",
          conversationId: chat.conversationId,
        })
      );
    }
  };

  const handleSend = (e: any) => {
    e.preventDefault();
    if (
      !message.trim() ||
      !selectedChat ||
      !ws ||
      ws.readyState !== WebSocket.OPEN
    )
      return;

    const payload = {
      fromUserId: seller.id,
      toUserId: selectedChat.user.id,
      messageBody: message,
      conversationId: selectedChat.conversationId,
      senderType: "seller",
    };

    ws.send(JSON.stringify(payload));

    setMessage("");
    scrollToBottom();
  };

  return (
    <div className="w-full -m-6 h-[calc(100vh-4rem)]">
      <div className="flex h-full overflow-hidden">
        {/* Contact list panel */}
        <div className="w-[300px] flex-shrink-0 border-r border-white/8 bg-[#0a0a0a] flex flex-col">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-white font-bold text-base">Messages</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-white/5 rounded w-24" />
                      <div className="h-2.5 bg-white/5 rounded w-36" />
                    </div>
                  </div>
                ))}
              </div>
            ) : chats.length === 0 ? (
              <p className="text-center py-10 text-white/25 text-sm">No conversations yet</p>
            ) : (
              chats.map((chat) => {
                const isActive = selectedChat?.conversationId === chat.conversationId;
                return (
                  <button
                    key={chat.conversationId}
                    onClick={() => handleChatSelect(chat)}
                    className={`w-full text-left px-4 py-3 transition-all duration-200 border-l-2 ${
                      isActive
                        ? "border-l-violet-500 bg-violet-500/8"
                        : "border-l-transparent hover:bg-white/3"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <Image
                          src={chat.user?.avatar || "https://ik.imagekit.io/shahriarbecodemy/avatar/6_t8b5y8t3U.png"}
                          alt={chat.user?.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover w-10 h-10 border border-white/10"
                        />
                        {chat.user?.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0a0a]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white truncate">{chat.user?.name}</span>
                          {chat?.unreadCount > 0 && (
                            <Badge className="ml-2 text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-1.5 py-0.5 flex-shrink-0">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/35 truncate mt-0.5">{chat.lastMessage || "Start chatting"}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat content */}
        <div className="flex flex-col flex-1 overflow-hidden bg-[#0d0d0d]">
          {selectedChat ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/8 bg-[#111111]">
                <div className="relative">
                  <Image
                    src={selectedChat.user?.avatar || "https://ik.imagekit.io/shahriarbecodemy/avatar/6_t8b5y8t3U.png"}
                    alt={selectedChat.user?.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover w-10 h-10 border border-white/10"
                  />
                  {selectedChat.user?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#111111]" />
                  )}
                </div>
                <div>
                  <h2 className="text-white font-semibold text-sm">{selectedChat.user?.name}</h2>
                  <p className="text-xs text-white/35">{selectedChat.user?.isOnline ? "Online" : "Offline"}</p>
                </div>
              </div>

              {/* Messages area */}
              <div
                className="flex-1 overflow-y-auto px-6 py-5 space-y-3 text-sm"
                ref={messageContainerRef}
              >
                {messages.map((msg: any, idx: number) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.senderType === "seller" ? "items-end" : "items-start"} max-w-[72%] ${msg.senderType === "seller" ? "ml-auto" : ""}`}
                  >
                    <div
                      className={`px-4 py-2.5 text-sm w-fit max-w-full break-words ${
                        msg.senderType === "seller"
                          ? "bg-violet-600 text-white rounded-2xl rounded-br-sm"
                          : "bg-white/5 border border-white/8 text-white/80 rounded-2xl rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-white/25 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Input */}
              <ChatInput
                message={message}
                setMessage={setMessage}
                onSendMessage={handleSend}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/8 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-white/30 text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
