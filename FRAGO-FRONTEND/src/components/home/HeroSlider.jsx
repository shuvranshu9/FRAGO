import React, { useState, useEffect } from "react";

const HeroSlider = () => {
  const slides = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
      title: "Luxury & Essence",
      subtitle: "Collection 2026",
      description:
        "Experience the ultimate collection of refined fragrances designed for the modern individual who seeks prestige.",
      buttonText: "Shop Collection",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
      title: "Timeless & Grace",
      subtitle: "New Arrival",
      description:
        "Discover a world of luxury where every scent tells a story of sophistication and timeless elegance.",
      buttonText: "Browse Now",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800",
      title: "Pure & Seduction",
      subtitle: "Premium Choice",
      description:
        "Unveil your inner passion with our boldest and most captivating fragrance lineup yet.",
      buttonText: "Explore More",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimate, setIsAnimate] = useState(true);

  const nextSlide = () => {
    setIsAnimate(false);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setIsAnimate(true);
    }, 500);
  };

  const prevSlide = () => {
    setIsAnimate(false);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      setIsAnimate(true);
    }, 500);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[65vh] md:h-[75vh] bg-[#F7F1ED] overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 flex flex-col md:flex-row items-center justify-center md:justify-between transition-opacity duration-700 ease-in-out ${
              index === currentSlide
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Content Side - Reordered for mobile */}
            <div
              className={`flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-4 md:space-y-6 pt-10 md:pt-0 transition-all duration-1000 transform ${
                index === currentSlide && isAnimate
                  ? "translate-x-0 opacity-100"
                  : "md:-translate-x-10 translate-y-10 md:translate-y-0 opacity-0"
              }`}
            >
              <span className="text-[10px] md:text-sm font-medium tracking-[0.2em] text-gray-400 uppercase">
                {slide.subtitle}
              </span>
              <h2 className="text-4xl md:text-7xl font-serif font-medium text-gray-900 leading-[1.1]">
                {slide.title.split(" & ")[0]} <br />
                <span className="italic font-light">
                  & {slide.title.split(" & ")[1]}
                </span>
              </h2>
              <p className="text-xs md:text-base text-gray-500 font-light max-w-xs md:max-w-md leading-relaxed">
                {slide.description}
              </p>
              <button className="px-8 py-3 bg-[#5C4033] text-white text-[10px] md:text-xs uppercase tracking-widest hover:bg-green-900 transition-all duration-300 shadow-sm">
                {slide.buttonText}
              </button>
            </div>

            {/* Image Side - Fixed for mobile */}
            <div
              className={`flex-1 flex justify-center md:justify-end items-center mt-4 md:mt-0 transition-all duration-1000 transform ${
                index === currentSlide && isAnimate
                  ? "scale-100 opacity-100"
                  : "scale-90 opacity-0"
              }`}
            >
              <div className="relative w-[180px] h-[240px] sm:w-[200px] sm:h-[280px] md:w-[450px] md:h-[550px] group">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover md:object-contain rounded-lg md:rounded-none drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                />
                {/* Optional: Add subtle overlay for better text contrast on mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent md:hidden rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicators - Adjusted for mobile */}
      <div className="absolute bottom-4 md:bottom-10 left-1/2 md:left-46 -translate-x-1/2 md:translate-x-0 z-30 flex items-center space-x-6 md:space-x-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="group flex flex-col items-center md:items-start"
          >
            <span
              className={`text-[10px] font-mono mb-1 transition-colors ${
                index === currentSlide ? "text-gray-900" : "text-gray-400"
              }`}
            >
              0{index + 1}
            </span>
            <div
              className={`h-[1px] transition-all duration-500 ${
                index === currentSlide
                  ? "w-8 bg-gray-900"
                  : "w-4 bg-gray-300 group-hover:w-6"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
