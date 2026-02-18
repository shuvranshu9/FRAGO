import { useState } from "react";
import BrandCard from "../../components/brand/BrandCard";
import perfumeImage from "../../assets/brands/perfume.png";

const MOCK_BRANDS = [
  {
    id: "chanel",
    name: "Chanel",
    description: "Timeless elegance and avant-garde spirit since 1910.",
    logo: "https://static.vecteezy.com/system/resources/thumbnails/023/400/850/small/chanel-brand-clothes-symbol-logo-black-design-fashion-illustration-free-vector.jpg",
  },
  {
    id: "dior",
    name: "Dior",
    description:
      "The essence of French luxury and sophisticated floral compositions.",
    logo: "https://cdn.shopify.com/s/files/1/0873/1285/9483/articles/Dior_Logo.png?v=1754924218",
  },
  {
    id: "gucci",
    name: "Gucci",
    description: "Bold, eccentric, and contemporary Italian craftsmanship.",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEfOhb0U0Q-9hMTGRlSYoAMiy-0L61SHMo7A&s",
  },
  {
    id: "tom-ford",
    name: "Tom Ford",
    description: "Modern glamour and provocative luxury in every bottle.",
    logo: "https://logowik.com/content/uploads/images/tom-ford5006.logowik.com.webp",
  },
  {
    id: "creed",
    name: "Creed",
    description:
      "An independent house with a royal legacy spanning over 250 years.",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4gsGZX5jwJBg3CImGVgBb0AN83ry10cEs3w&s",
  },
  {
    id: "byredo",
    name: "Byredo",
    description:
      "Translating memories and emotions into products and experiences.",
    logo: "https://i.pinimg.com/736x/ba/8e/5b/ba8e5b551c2c641e21a90e44ca2a4a6e.jpg",
  },
  {
    id: "davidoff",
    name: "Davidoff",
    description: "The essence of fresh and aquatic luxury.",
    logo: "https://nacosofficial.com/cdn/shop/collections/Davidoff-Logo.png?v=1720426579&width=1050",
  },
  {
    id: "calvin-klein",
    name: "Calvin Klein",
    description: "Minimalist and provocative modern style.",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxwKrMjLpT8sKlHqAaeUdZD5edaxU2Pfrd6Q&s",
  },
  {
    id: "versace",
    name: "Versace",
    description: "Iconic glamor and high-fashion intensity.",
    logo: "https://logowik.com/content/uploads/images/versace5666.jpg",
  },
  {
    id: "bvlgari",
    name: "Bvlgari",
    description: "Master of colored gemstones and exquisite fragrances.",
    logo: "https://download.logo.wine/logo/Bulgari/Bulgari-Logo.wine.png",
  },
  {
    id: "armani",
    name: "Giorgio Armani",
    description: "Understated elegance and timeless refinement.",
    logo: "https://static.vecteezy.com/system/resources/previews/023/585/888/non_2x/giorgio-armani-brand-logo-symbol-black-design-clothes-fashion-illustration-free-vector.jpg",
  },
  {
    id: "hugo-boss",
    name: "Hugo Boss",
    description: "Sophisticated confidence for the modern professional.",
    logo: "https://static.vecteezy.com/system/resources/previews/023/400/487/non_2x/hugo-boss-brand-clothes-logo-symbol-black-design-sportwear-fashion-illustration-free-vector.jpg",
  },
  {
    id: "paco-rabanne",
    name: "Paco Rabanne",
    description: "Innovative, provocative, and bold fragrances.",
    logo: "https://cdn.worldvectorlogo.com/logos/paco-rabanne-1.svg",
  },
  {
    id: "montblanc",
    name: "Montblanc",
    description: "Peak craftsmanship and adventurous spirit.",
    logo: "https://fimgs.net/mdimg/dizajneri/o.107.jpg",
  },
  {
    id: "cr7",
    name: "CR7",
    description: "Avant-garde sophistication and intellectual luxury.",
    logo: "https://cdn.shopify.com/s/files/1/0281/0635/8862/files/CR7-logo_2x_303833de-98c0-42d7-a8eb-7d8d4cab383e.png?height=628&pad_color=fff&v=1613681212",
  },
];

const BrandsPage = () => {
  const [filteredBrands] = useState(MOCK_BRANDS);

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <header className="relative py-0 md:py-24 px-4 md:px-8 bg-[#FAF6F3] overflow-hidden ">
        <div className="max-w-6xl mx-auto relative z-10 ">
          <div className="flex items-center justify-between gap-12">
            {/* Left Content */}
            <div className="max-w-2xl animate-slide-up">
              <span className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-4 block">
                Curated Selection
              </span>
              <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-8 leading-tight">
                Our Fragrance <br /> Houses
              </h1>
              <p className="text-gray-600 text-lg md:text-xl font-light leading-relaxed mb-10">
                Explore the world's most prestigious perfume brands, each with
                its own story, heritage, and signature olfactory profile.
              </p>
            </div>

            {/* Right Image */}
            <div className="hidden lg:block flex-1 relative animate-float">
              <div className="relative w-full max-w-md ml-auto">
                {/* Decorative blur effect */}
                <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>

                {/* Main image */}
                <img
                  src={perfumeImage}
                  alt="Luxury Perfume Bottle"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Brands Grid */}
      <section className="px-4 md:px-8 mb-6 md:mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 animate-fade-in delay-100">
            {filteredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>
      </section>

      {/* Luxury Footer Invite */}
      <section className="py-20 px-4 md:px-8 bg-green-900 text-white overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif mb-8">
            Can't find your favorite house?
          </h2>
          <p className="text-gray-400 text-lg font-light mb-10">
            We are constantly expanding our collection with artisanal and
            heritage brands from across the globe. Join our newsletter to be the
            first to know about new arrivals.
          </p>
        </div>

        {/* Decorative background text */}
        <div className="absolute md:-bottom-10 bottom-4 right-10 md:text-[110px] text-[60px] font-serif text-white/5 whitespace-nowrap select-none pointer-events-none uppercase">
          Fragrance
        </div>
      </section>
    </div>
  );
};

export default BrandsPage;
