import React from "react";
import { Link } from "react-router-dom";

const Collections = () => {
  const collections = [
    {
      id: 1,
      name: "Masculine",
      image:
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
      link: "/collections/men",
    },
    {
      id: 2,
      name: "Feminine",
      image:
        "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
      link: "/collections/women",
    },
    {
      id: 3,
      name: "Unisex",
      image:
        "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600",
      link: "/collections/unisex",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-gray-900 mb-4">
            Curated Collections
          </h2>
          <div className="w-20 h-px bg-green-900 mx-auto opacity-50"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={collection.link}
              className="group relative overflow-hidden bg-gray-100 aspect-[4/5] block"
            >
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500"></div>
              <div className="absolute bottom-10 left-0 right-0 text-center">
                <h3 className="text-2xl md:text-3xl font-serif text-white drop-shadow-md">
                  {collection.name}
                </h3>
                <span className="text-white/80 text-xs uppercase tracking-widest mt-2 inline-block opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  Discover More
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
