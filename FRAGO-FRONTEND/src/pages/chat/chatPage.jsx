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

const MOCK_FRIENDS = [
  {
    id: 1,
    name: "Aura Fragrances",
    gender: "female",
    lastMessage: "The new floral collection is now in stock!",
    time: "10:30 AM",
    status: "online",
    unread: 2,
    role: "vendor",
  },
  {
    id: 2,
    name: "John Doe",
    gender: "male",
    lastMessage: "Is the discount still valid for bulk orders?",
    time: "Yesterday",
    status: "offline",
    unread: 0,
    role: "buyer",
  },
  {
    id: 3,
    name: "Luxury Scents Co.",
    gender: "female",
    lastMessage: "Thank you for your purchase!",
    time: "Monday",
    status: "online",
    unread: 0,
    role: "vendor",
  },
  {
    id: 4,
    name: "Sarah Miller",
    gender: "female",
    lastMessage: "I love the woody notes in this one.",
    time: "2 days ago",
    status: "offline",
    unread: 5,
    role: "buyer",
  },
];

const MOCK_MESSAGES = [
  {
    id: 1,
    senderId: 0,
    text: "Hi there! I was looking for the Intense Oud perfume.",
    time: "10:00 AM",
    isMe: true,
  },
  {
    id: 2,
    senderId: 1,
    text: "Hello! Yes, we have that in stock. It's one of our best-sellers.",
    time: "10:05 AM",
    isMe: false,
  },
  {
    id: 3,
    senderId: 0,
    text: "Great! Do you offer any discount for 3 bottles?",
    time: "10:06 AM",
    isMe: true,
  },
  {
    id: 4,
    senderId: 1,
    text: "Of course! We can give you a 15% discount for 3 bottles or more.",
    time: "10:08 AM",
    isMe: false,
  },
  {
    id: 5,
    senderId: 1,
    text: "The new floral collection is now in stock!",
    time: "10:30 AM",
    isMe: false,
  },
];

export default function ChatPage() {
  const location = useLocation();
  const { vendorId, vendorName } = location.state || {};

  const [selectedChat, setSelectedChat] = useState(
    vendorId
      ? { id: vendorId, name: vendorName, role: "vendor", status: "online" }
      : MOCK_FRIENDS[0],
  );
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesContainerRef = useRef(null);
  const isFirstRun = useRef(true);

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
    if (isFirstRun.current) {
      isFirstRun.current = false;
      // Scroll to bottom instantly on load
      scrollToBottom("auto");
      return;
    }
    scrollToBottom("smooth");
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      senderId: 0,
      text: inputValue,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Simple bot reply simulation
    setTimeout(() => {
      const botReply = {
        id: messages.length + 2,
        senderId: selectedChat.id,
        text: "This is a demo reply. Real-time updates will be active once connected to the backend!",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: false,
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1000);
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
          {MOCK_FRIENDS.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat);
                if (window.innerWidth < 768) setShowSidebar(false);
              }}
              className={`
                p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 border-l-4
                ${
                  selectedChat.id === chat.id
                    ? "bg-purple-50/50 border-purple-600"
                    : "bg-white border-transparent hover:bg-gray-50"
                }
              `}
            >
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${chat.gender === "female" ? "bg-pink-100 text-pink-500" : "bg-blue-100 text-blue-500"}`}
                >
                  <User className="w-6 h-6" />
                </div>
                {chat.status === "online" && (
                  <Circle className="w-3 h-3 fill-green-500 text-green-500 absolute bottom-0 right-0 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3
                    className={`font-semibold truncate ${selectedChat.id === chat.id ? "text-purple-900" : "text-gray-800"}`}
                  >
                    {chat.name}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                    {chat.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p
                    className={`text-xs truncate ${chat.unread > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}
                  >
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${selectedChat.gender === "female" ? "bg-pink-100 text-pink-500" : "bg-blue-100 text-blue-500"}`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  {selectedChat.status === "online" && (
                    <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500 absolute bottom-0 right-0 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 leading-tight">
                    {selectedChat.name}
                  </h2>
                  <span className="text-[10px] text-green-600 font-medium tracking-wide uppercase">
                    {selectedChat.status === "online"
                      ? "Active now"
                      : "Offline"}
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
              <div className="flex justify-center mb-6">
                <span className="text-[10px] bg-gray-100 text-gray-400 py-1 px-3 rounded-full font-medium uppercase tracking-widest">
                  Today
                </span>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMe ? "justify-end" : "justify-start"} animate-slide-up`}
                >
                  <div
                    className={`
                    max-w-[80%] lg:max-w-[70%] p-3 rounded-2xl shadow-sm text-sm relative
                    ${
                      msg.isMe
                        ? "bg-purple-600 text-white rounded-tr-none"
                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                    }
                  `}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 justify-end ${msg.isMe ? "text-purple-200" : "text-gray-400"}`}
                    >
                      <span className="text-[9px] uppercase">{msg.time}</span>
                      {msg.isMe && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              ))}
              {/* End anchor (scrolled via Ref) */}
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
