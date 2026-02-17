import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const BrandCard = ({ brand }) => {
  return (
    <div className="group relative bg-[#FAF6F3] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
      {/* Brand Image/Logo Container */}
      <div className="aspect-[16/10] overflow-hidden bg-white flex items-center justify-center p-8">
        <img
          src={
            brand.logo ||
            "https://images.unsplash.com/photo-1541604193435-22287d32c2c2?auto=format&fit=crop&q=80&w=300"
          }
          alt={brand.name}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Brand Info */}
      <div className="p-8 pb-12">
        <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-3 block">
          House of Fragrance
        </span>
        <h3 className="text-2xl font-serif text-gray-900 mb-4 transition-colors">
          {brand.name}
        </h3>
        <p className="text-gray-500 font-light text-sm leading-relaxed mb-6">
          {brand.description ||
            "Discover the unique olfactory journey crafted by " +
              brand.name +
              "."}
        </p>

        <div className="w-12 h-px bg-primary/30 group-hover:w-24 transition-all duration-500"></div>
      </div>

      {/* Decorative Border */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );
};

export default BrandCard;
