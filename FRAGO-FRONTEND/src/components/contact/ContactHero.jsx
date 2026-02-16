import { theme } from "../../styles/theme";

const ContactHero = () => {
  return (
    <section className="relative w-full py-20 bg-[#F7F1ED] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center relative z-10">
        <span
          className="inline-block text-xs md:text-sm font-medium tracking-[0.4em] uppercase mb-4"
          style={{ color: theme.colors.text.secondary }}
        >
          Customer Service
        </span>
        <h1
          className="text-5xl md:text-7xl font-serif mb-6"
          style={{
            fontFamily: theme.fonts.heading,
            color: theme.colors.text.primary,
          }}
        >
          Get in <span className="italic font-light">Touch</span>
        </h1>
        <p
          className="text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed"
          style={{ color: theme.colors.text.primary, opacity: 0.8 }}
        >
          Whether you have a question about our collections or need assistance
          with an order, our team is here to help you find your perfect essence.
        </p>
      </div>

      {/* Decorative element */}
      <div
        className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 rounded-full opacity-10"
        style={{ backgroundColor: theme.colors.primary }}
      />
    </section>
  );
};

export default ContactHero;
