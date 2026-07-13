"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MessageSquare } from "lucide-react";
import useSeller from "@/hooks/useSeller";
import { useWebSocket } from "@/context/web-socket-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import ChatInput from "@/shared/components/chatinput";

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
  const [search, setSearch] = useState("");

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

  const filteredChats = chats.filter(
    (c) => !search || c.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">Inbox</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Chat with your customers in real-time</p>
      </div>

      {/* Chat container */}
      <div className="flex h-[calc(100vh-210px)] overflow-hidden rounded-[16px] border border-[#e8ebd4] bg-white shadow-sm">

        {/* Sidebar ── conversation list */}
        <div className="w-[270px] shrink-0 border-r border-[#f0f2e0] flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-[#f0f2e0]">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full h-9 pl-8 pr-3 rounded-xl border border-[#e8ebd4] bg-[#fafbf5] text-sm outline-none focus:border-lime-400 placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f5f6ee]">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-[#86b81d]/30 border-t-[#86b81d] animate-spin" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <MessageSquare size={28} className="text-muted-foreground/25 mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isActive = selectedChat?.conversationId === chat.conversationId;
                return (
                  <button
                    key={chat.conversationId}
                    onClick={() => handleChatSelect(chat)}
                    className={`w-full text-left px-4 py-3 transition-colors ${isActive ? "bg-[#f8fbe8] border-l-2 border-l-[#86b81d]" : "hover:bg-[#fafbf5]"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={chat.user?.avatar || "https://ik.imagekit.io/shahriarpenderghast/avatar/6_t8b5y8t3U.png"}
                          alt={chat.user?.name}
                          className="rounded-full w-9 h-9 object-cover border border-[#e8ebd4]"
                        />
                        {chat.user?.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#17320f] truncate">{chat.user?.name}</span>
                          {chat?.unreadCount > 0 && (
                            <span className="ml-1 shrink-0 text-[10px]  text-white rounded-full px-1.5 py-0.5">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                          {chat.lastMessage || ""}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat pane */}
        <div className="flex flex-col flex-1 min-w-0 bg-[#fafbf5]">
          {selectedChat ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f0f2e0] bg-white shrink-0">
                <div className="relative shrink-0">
                  <img
                    src={selectedChat.user?.avatar || "https://ik.imagekit.io/shahriarpenderghast/avatar/6_t8b5y8t3U.png"}
                    alt={selectedChat.user.name}
                    className="rounded-full w-9 h-9 object-cover border border-[#e8ebd4]"
                  />
                  {selectedChat.user?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#17320f]">{selectedChat.user?.name}</h2>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedChat.user?.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-5 py-5 space-y-3"
                ref={messageContainerRef}
              >
                {messages.map((msg: any, idx: number) => (
                  <div
                    key={idx}
                    className={`flex ${msg.senderType === "seller" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[72%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.senderType === "seller"
                        ? " text-white rounded-br-sm"
                        : "bg-white text-[#17320f] border border-[#e8ebd4] rounded-bl-sm"
                        }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.senderType === "seller" ? "text-white/70" : "text-muted-foreground/50"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
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
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f4d8]">
                <MessageSquare size={26} className="text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/70">Select a conversation</p>
                <p className="text-xs text-muted-foreground/50 mt-0.5">Choose from the left to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
