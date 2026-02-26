import { useState, useEffect } from "react";
import { ChevronsUp } from "lucide-react";
import GoToTopImg from "../../assets/global/GoToTop.png";

const GoToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Toggle visibility based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
          @keyframes flowUp {
            0% { transform: translateY(10px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(-18px); opacity: 0; }
          }
        `}
      </style>
      <div
        className={`fixed bottom-8 right-8 z-50 flex flex-col items-center cursor-pointer transition-all duration-500 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
        onClick={scrollToTop}
      >
        {/* Flowing Arrow Animation Above */}
        <ChevronsUp
          className="text-[#2f5e3a] w-8 h-6 animate-[flowUp_1.5s_ease-in-out_infinite]"
          strokeWidth={2}
        />

        <button
          className="group relative flex flex-col items-center justify-center w-14 h-14 md:w-20 md:h-20 overflow-hidden"
          aria-label="Go to top"
        >
          <img
            src={GoToTopImg}
            alt="Scroll to top"
            className="w-full h-full object-contain drop-shadow-md relative z-10 opacity-90 group-hover:opacity-100 transition-opacity animate-[float_3s_ease-in-out_infinite]"
          />
        </button>
      </div>
    </>
  );
};

export default GoToTop;
