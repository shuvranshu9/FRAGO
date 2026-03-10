import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Bot,
  User,
  ChevronRight,
  RefreshCw,
  Sparkles,
  MapPin,
  Smile,
  ShoppingBag,
} from "lucide-react";
import api from "../../utils/api";
import { Link } from "react-router-dom";

const Recommendation = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [options, setOptions] = useState({
    moods: [],
    categories: [],
    places: [],
  });
  const [selections, setSelections] = useState({
    mood: "",
    category_id: "",
    place: "",
  });
  const [messages, setMessages] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const idCounter = useRef(0);

  const generateId = () => {
    idCounter.current += 1;
    return idCounter.current;
  };

  // Fetch options and initialize chat on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get("/recommend/options");
        setOptions(response.data);
      } catch (error) {
        console.error("Error fetching recommendation options:", error);
      }
    };
    fetchOptions();

    // Initialize first messages
    setMessages([
      {
        id: generateId(),
        type: "bot",
        text: "Hi there! I'm your FRAGO Scent Assistant. I can help you find the perfect perfume based on your mood, category, and where you're headed.",
      },
      {
        id: generateId(),
        type: "bot",
        text: "What mood are you in today? ✨",
        isQuestion: true,
        optionsType: "moods",
      },
    ]);
    setStep(1);
  }, []);

  // Handle scrolling to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSelection = async (type, value) => {
    // Add user message
    const userMsg = {
      id: generateId(),
      type: "user",
      text: value,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Update selections
    const newSelections = { ...selections, [type]: value };
    setSelections(newSelections);

    // Move to next step
    if (type === "mood") {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            type: "bot",
            text: `Wonderful! Now, who are we looking for? 👤`,
            isQuestion: true,
            optionsType: "categories",
          },
        ]);
        setStep(2);
      }, 600);
    } else if (type === "category_id") {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            type: "bot",
            text: `Perfect. Finally, which place or occasion are you visiting? 📍`,
            isQuestion: true,
            optionsType: "places",
          },
        ]);
        setStep(3);
      }, 600);
    } else if (type === "place") {
      setLoading(true);
      setStep(4);
      try {
        const response = await api.get("/recommend", {
          params: {
            mood: selections.mood,
            category_id: selections.category_id,
            place: value, // use the current value directly
          },
        });
        setResults(response.data.data);
        setTimeout(() => {
          setLoading(false);
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              type: "bot",
              text: `I've found ${response.data.data.length} matches for you! Check them out below:`,
            },
          ]);
          setStep(5);
        }, 1000);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            type: "bot",
            text: "Oops! I encountered an error while finding recommendations. Please try again.",
          },
        ]);
      }
    }
  };

  const resetChat = () => {
    setResults([]);
    setSelections({ mood: "", category_id: "", place: "" });
    setMessages([
      {
        id: generateId(),
        type: "bot",
        text: "Let's try again! What mood are you in today? ✨",
        isQuestion: true,
        optionsType: "moods",
      },
    ]);
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Chat Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 h-[80vh] md:h-[600px]">
        {/* Header */}
        <div className="bg-green-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                FRAGO Assistant
              </h3>
              <p className="text-xs text-green-100 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Online | AI Recommendations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Chat Body */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[85%] ${msg.type === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-3`}
              >
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.type === "user" ? "bg-green-100 ml-2" : "bg-green-900/10 mr-2"}`}
                >
                  {msg.type === "user" ? (
                    <User size={16} className="text-green-900" />
                  ) : (
                    <Bot size={16} className="text-green-900" />
                  )}
                </div>
                <div>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.type === "user"
                        ? "bg-green-900 text-white rounded-tr-none"
                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-900/10 flex items-center justify-center">
                  <Bot size={16} className="text-green-900" />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}

          {/* User selection area (Options) */}
          {!loading && step < 4 && (
            <div className="pl-11 grid grid-cols-2 gap-2 mt-4">
              {step === 1 &&
                options.moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => handleSelection("mood", mood)}
                    className="flex items-center justify-between px-4 py-3 bg-white border border-green-100 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all text-sm font-medium text-gray-700 group"
                  >
                    <span className="flex items-center">
                      <Smile size={16} className="mr-2 text-green-700" /> {mood}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-green-600 transition-colors"
                    />
                  </button>
                ))}
              {step === 2 &&
                options.categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleSelection("category_id", cat)}
                    className="flex items-center justify-between px-4 py-3 bg-white border border-green-100 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all text-sm font-medium text-gray-700 group"
                  >
                    <span className="flex items-center">
                      <User size={16} className="mr-2 text-green-700" /> {cat}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-green-600 transition-colors"
                    />
                  </button>
                ))}
              {step === 3 &&
                options.places.map((place) => (
                  <button
                    key={place}
                    onClick={() => handleSelection("place", place)}
                    className="flex items-center justify-between px-4 py-3 bg-white border border-green-100 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all text-sm font-medium text-gray-700 group"
                  >
                    <span className="flex items-center">
                      <MapPin size={16} className="mr-2 text-green-700" />{" "}
                      {place}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-green-600 transition-colors"
                    />
                  </button>
                ))}
            </div>
          )}

          {/* Results Display */}
          {step === 5 && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.length > 0 ? (
                  results.map((perfume) => (
                    <Link
                      to={`/product/${perfume.product_id || perfume.id}`}
                      key={perfume.id}
                      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col"
                      onClick={onClose}
                    >
                      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                        <img
                          src={perfume.image_url || "/placeholder-perfume.jpg"}
                          alt={perfume.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-green-900 shadow-sm uppercase tracking-wider">
                          {perfume.brand_name}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {perfume.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-green-700 font-bold text-sm">
                            Rs. {perfume.price}
                          </span>
                          <span className="text-[10px] text-gray-400 capitalize">
                            {perfume.gender} • {perfume.mood} • {perfume.place}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-gray-500">
                    <p>
                      I couldn't find any perfect matches for that combination.
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={resetChat}
                className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:text-green-900 hover:border-green-300 hover:bg-green-50 transition-all text-sm font-medium"
              >
                <RefreshCw size={16} />
                <span>Find another recommendation</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info or Input (Disabled as we use selection buttons) */}
        <div className="bg-white px-6 py-4 border-t border-gray-100">
          <div className="flex items-center text-[11px] text-gray-400 font-medium uppercase tracking-[0.1em] justify-center space-x-4">
            <span className="flex items-center">
              <Sparkles size={12} className="mr-1 text-green-600" /> AI Powered
            </span>
            <span>•</span>
            <span className="flex items-center">
              <ShoppingBag size={12} className="mr-1 text-green-600" /> Curated
              Collection
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendation;
