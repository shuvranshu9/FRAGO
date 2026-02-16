import { theme } from "../../styles/theme";
import bgImage from "../../assets/about/Hero.png";

const AboutHero = () => {
  return (
    <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden bg-[#F7F1ED]">
      {/* Background Pattern or Subtle Image */}
      <div className="absolute inset-0 opacity-90">
        <img
          src={bgImage}
          alt="Luxury Perfume Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mb-50 md:mb-0">
        <span
          className="inline-block text-xs md:text-sm font-medium tracking-[0.3em] uppercase mb-4"
          style={{ color: theme.colors.text.secondary }}
        >
          The FRAGO Journey
        </span>
        <h1
          className="text-5xl md:text-8xl font-serif mb-6 leading-tight"
          style={{
            fontFamily: theme.fonts.heading,
            color: theme.colors.text.primary,
          }}
        >
          Our Essence, <br />
          <span className="italic font-light">Your Story</span>
        </h1>
        <div
          className="w-24 h-[1px] mx-auto mb-8"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <p
          className="text-sm md:text-lg font-light max-w-2xl mx-auto leading-relaxed"
          style={{ color: theme.colors.text.primary, opacity: 0.8 }}
        >
          Crafting memories in every bottle. Discover the artistry and passion
          behind our signature fragrances.
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
