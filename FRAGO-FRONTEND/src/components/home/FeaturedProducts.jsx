import { Link } from "react-router-dom";
import { ShoppingBag, Eye } from "lucide-react";
import f1 from "../../assets/home/f1.png";
import f2 from "../../assets/home/f2.png";
import f3 from "../../assets/home/f3.png";
import f4 from "../../assets/home/f4.png";

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: "Oud Royale",
      brand: "Frago Signature",
      price: "NPR 12000.00",
      image: f1,
    },
    {
      id: 2,
      name: "Midnight Rose",
      brand: "Ethereal Collection",
      price: "NPR 9500.00",
      image: f2,
    },
    {
      id: 3,
      name: "Velvet Amber",
      brand: "Luxury Series",
      price: "NPR 15000.00",
      image: f3,
    },
    {
      id: 4,
      name: "Silver Mist",
      brand: "Fresh Elements",
      price: "NPR 8500.00",
      image: f4,
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-[#FAF6F3]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest text-[#5C4033] font-semibold mb-2 block">
            Best Sellers
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-gray-900 mb-4">
            Featured Fragrances
          </h2>
          <div className="w-20 h-px bg-[#5C4033] mx-auto opacity-30"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group flex flex-col items-center">
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-white mb-6">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                  <button className="p-3 bg-white text-gray-900 rounded-full shadow-lg hover:bg-[#5C4033] hover:text-white transition-colors duration-300">
                    <ShoppingBag size={20} />
                  </button>
                  <Link
                    to={`/product/${product.id}`}
                    className="p-3 bg-white text-gray-900 rounded-full shadow-lg hover:bg-[#5C4033] hover:text-white transition-colors duration-300"
                  >
                    <Eye size={20} />
                  </Link>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  {product.brand}
                </p>
                <h3 className="text-lg font-serif text-gray-900 mb-1 group-hover:text-[#5C4033] transition-colors">
                  {product.name}
                </h3>
                <p className="font-medium text-gray-800 tracking-tight">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/shop"
            className="inline-block border-b border-gray-900 pb-1 text-xs uppercase tracking-widest text-gray-900 hover:text-green-900 hover:border-green-900 transition-all font-semibold"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
