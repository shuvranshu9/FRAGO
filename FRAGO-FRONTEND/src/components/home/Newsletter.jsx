import { Mail } from "lucide-react";

const Newsletter = () => {
  return (
    <section className="py-20 bg-[#FAF6F3]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-8">
          <Mail className="text-green-900" size={24} />
        </div>

        <h2 className="text-3xl md:text-5xl font-serif font-medium text-gray-900 mb-6">
          Fragrance in Your Inbox
        </h2>

        <p className="text-gray-500 font-light mb-10 max-w-xl mx-auto leading-relaxed">
          Subscribe to receive updates on new arrivals, exclusive offers, and
          the latest trends in the world of luxury fragrances.
        </p>

        <form
          className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Your Email Address"
            className="flex-1 px-6 py-4 bg-white border border-gray-100 focus:outline-none focus:border-green-900 transition-colors text-sm font-light"
            required
          />
          <button
            type="submit"
            className="px-8 py-4 bg-gray-900 text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-green-900 transition-colors duration-300"
          >
            Subscribe
          </button>
        </form>

        <p className="text-[10px] text-gray-400 mt-6 uppercase tracking-widest">
          By subscribing you agree to our Privacy Policy
        </p>
      </div>
    </section>
  );
};

export default Newsletter;
