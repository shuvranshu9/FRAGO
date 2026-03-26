import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  Plus,
  Smile,
  Send,
  ArrowLeft,
  CheckCheck,
  Circle,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../utils/api";
import { toast } from "react-toastify";

// Mock data removed

export default function ChatPage() {
  const location = useLocation();
  const { vendorId, vendorName } = location.state || {};
  const { user, isAuthenticated } = useAuth();
  const { socket, decrementUnreadCount } = useSocket();
  
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesContainerRef = useRef(null);
  const fetchingChatsRef = useRef(false);
  const selectedChatRef = useRef(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const scrollToBottom = (behavior = "smooth") => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: behavior,
      });
    }
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await api.get("/chat");
        setChats(response.data);
        
        // If coming from product page, find or create chat
        if (vendorId) {
          const existingChat = response.data.find(c => c.vendor_id === vendorId || c.buyer_id === vendorId);
          if (existingChat) {
            setSelectedChat(existingChat);
          } else {
            const newChatResponse = await api.post("/chat", { vendorId });
            const newChat = newChatResponse.data;
            newChat.buyer_name = user?.full_name;
            newChat.vendor_name = vendorName;
            setChats(prev => [newChat, ...prev]);
            setSelectedChat(newChat);
          }
        } else if (response.data.length > 0 && !selectedChatRef.current) {
          setSelectedChat(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && !fetchingChatsRef.current) {
      fetchingChatsRef.current = true;
      fetchChats();
    }
  }, [isAuthenticated, vendorId, vendorName, user?.full_name]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message) => {
        // Update messages if it's the current chat
        if (selectedChatRef.current?.chat_id === message.chat_id) {
            setMessages(prev => {
              if (prev.find(m => m.message_id === message.message_id)) return prev;
              return [...prev, message];
            });
            // Mark as read immediately if it's the active chat
            api.put(`/message/mark-read/${message.chat_id}`).catch(err => console.error(err));
        }

        // Update chat list last message and unread count
        setChats(prev => prev.map(c => {
          if (c.chat_id === message.chat_id) {
            const isActive = selectedChatRef.current?.chat_id === message.chat_id;
            const isFromOther = message.sender_id !== user?.userID;
            const isUnread = !isActive && isFromOther;
            
            return { 
              ...c, 
              last_message: message.message_text, 
              last_message_time: message.sent_at,
              unread_count: isUnread ? (c.unread_count || 0) + 1 : (c.unread_count || 0)
            };
          }
          return c;
        }).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time)));
      };

      socket.on("newMessage", handleNewMessage);
      
      return () => {
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [socket, user?.userID]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      setMessageLoading(true);
      try {
        const response = await api.get(`/message/${selectedChat.chat_id}`);
        setMessages(response.data);
        
        // Mark as read and update navbar
        if (selectedChat.unread_count > 0) {
          await api.put(`/message/mark-read/${selectedChat.chat_id}`);
          decrementUnreadCount(selectedChat.unread_count);
          
          setChats(prev => prev.map(c => 
            c.chat_id === selectedChat.chat_id ? { ...c, unread_count: 0 } : c
          ));
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setMessageLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat?.chat_id, selectedChat, decrementUnreadCount]); // Include selectedChat to satisfy lint, but logic uses chat_id

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedChat) return;

    const messageText = inputValue;
    setInputValue("");

    try {
      const response = await api.post("/message", {
        chat_id: selectedChat.chat_id,
        message_text: messageText
      });
      
      const newMessage = response.data;
      setMessages(prev => {
        if (prev.find(m => m.message_id === newMessage.message_id)) return prev;
        return [...prev, newMessage];
      });
      
      // Update chat list last message
      setChats(prev => prev.map(c => {
        if (c.chat_id === selectedChat.chat_id) {
          return { ...c, last_message: newMessage.message_text, last_message_time: newMessage.sent_at };
        }
        return c;
      }).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time)));

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const getChatPartnerName = (chat) => {
    if (!chat) return "";
    return chat.buyer_id === user?.userID ? chat.vendor_name : chat.buyer_name;
  };

  return (
    <div className="flex h-[600px] lg:h-[560px] bg-gray-50 overflow-hidden font-sans border border-gray-100 rounded-xl m-2 lg:m-4 shadow-2xl animate-fade-in">
      {/* Sidebar */}
      <div
        className={`
        ${showSidebar ? "flex" : "hidden md:flex"} 
        flex-col w-full md:w-80 lg:w-96 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out
      `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Messages
            </h1>
            <div className="p-2 bg-gray-50 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
              <Plus className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-2 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-xs">Loading conversations...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 p-4">
              <p className="text-sm text-center">No conversations yet.</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.chat_id}
                onClick={() => {
                  setSelectedChat(chat);
                  if (window.innerWidth < 768) setShowSidebar(false);
                }}
                className={`
                  p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 border-l-4
                  ${
                    selectedChat?.chat_id === chat.chat_id
                      ? "bg-purple-50/50 border-purple-600"
                      : "bg-white border-transparent hover:bg-gray-50"
                  }
                `}
              >
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${chat.vendor_id === user?.userID ? "bg-blue-100 text-blue-500" : "bg-pink-100 text-pink-500"}`}
                  >
                    <User className="w-6 h-6" />
                  </div>
                  <Circle className="w-3 h-3 fill-green-500 text-green-500 absolute bottom-0 right-0 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3
                      className={`font-semibold truncate ${selectedChat?.chat_id === chat.chat_id ? "text-purple-900" : "text-gray-800"}`}
                    >
                      {getChatPartnerName(chat)}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                      {chat.last_message_time ? new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-xs truncate ${chat.unread_count > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}
                    >
                      {chat.last_message || "No messages yet"}
                    </p>
                    {chat.unread_count > 0 && (
                      <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`
        ${!showSidebar ? "flex" : "hidden md:flex"} 
        flex-1 flex-col bg-white relative
      `}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${selectedChat.vendor_id === user?.userID ? "bg-blue-100 text-blue-500" : "bg-pink-100 text-pink-500"}`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500 absolute bottom-0 right-0 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 leading-tight">
                    {getChatPartnerName(selectedChat)}
                  </h2>
                  <span className="text-[10px] text-green-600 font-medium tracking-wide uppercase">
                    Active now
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5 scroll-smooth"
            >
              {messageLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p>No messages in this conversation yet.</p>
                  <p className="text-xs">Start the conversation below!</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <span className="text-[10px] bg-gray-100 text-gray-400 py-1 px-3 rounded-full font-medium uppercase tracking-widest">
                      Conversation Started
                    </span>
                  </div>

                  {messages.map((msg) => (
                    <div
                      key={msg.message_id}
                      className={`flex ${msg.sender_id === user?.userID ? "justify-end" : "justify-start"} animate-slide-up`}
                    >
                      <div
                        className={`
                        max-w-[80%] lg:max-w-[70%] p-3 rounded-2xl shadow-sm text-sm relative
                        ${
                          msg.sender_id === user?.userID
                            ? "bg-purple-600 text-white rounded-tr-none"
                            : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                        }
                      `}
                      >
                        <p className="leading-relaxed">{msg.message_text}</p>
                        <div
                          className={`flex items-center gap-1 mt-1 justify-end ${msg.sender_id === user?.userID ? "text-purple-200" : "text-gray-400"}`}
                        >
                          <span className="text-[9px] uppercase">
                            {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.sender_id === user?.userID && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 bg-gray-50 p-2 pl-4 rounded-2xl border border-transparent focus-within:border-purple-200 focus-within:bg-white transition-all shadow-sm"
              >
                <button
                  type="button"
                  className="text-gray-400 hover:text-purple-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400 py-2"
                />
                <button
                  type="button"
                  className="text-gray-400 hover:text-purple-600 transition-colors hidden sm:block"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={`
                    p-2.5 rounded-xl transition-all shadow-md
                    ${
                      inputValue.trim()
                        ? "bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 active:scale-95"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
              <Send className="w-8 h-8 text-purple-200" />
            </div>
            <h2 className="text-lg font-bold text-gray-700">Your Messages</h2>
            <p className="text-sm">Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
