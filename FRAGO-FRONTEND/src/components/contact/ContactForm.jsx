import { theme } from "../../styles/theme";

const ContactForm = () => {
  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
            Your Name
          </label>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-green-800 transition-colors"
            placeholder="Enter your name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
            Email Address
          </label>
          <input
            type="email"
            className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-green-800 transition-colors"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
          Subject
        </label>
        <select className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-green-800 transition-colors appearance-none">
          <option>General Inquiry</option>
          <option>Order Support</option>
          <option>Wholesale</option>
          <option>Press</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
          Message
        </label>
        <textarea
          rows="5"
          className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-green-800 transition-colors resize-none"
          placeholder="How can we assist you?"
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 text-white text-[10px] uppercase tracking-[0.3em] font-semibold transition-all duration-300 hover:bg-green-950 shadow-lg"
        style={{ backgroundColor: theme.colors.primary }}
      >
        Send Message
      </button>
    </form>
  );
};

export default ContactForm;
