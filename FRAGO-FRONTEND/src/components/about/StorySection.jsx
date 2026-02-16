import { theme } from "../../styles/theme";

const StorySection = () => {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 lg:gap-24">
        {/* Image Grid Content */}
        <div className="flex-1 relative order-2 md:order-1">
          <div className="relative z-10 w-full aspect-[4/5] rounded-sm overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800"
              alt="Perfumer at work"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Decorative frame */}
          <div
            className="absolute -top-6 -left-6 w-full h-full border-[1px] border-solid -z-0"
            style={{ borderColor: theme.colors.primary, opacity: 0.2 }}
          />
        </div>

        {/* Text Content */}
        <div className="flex-1 order-1 md:order-2 space-y-8">
          <div className="space-y-4">
            <h2
              className="text-3xl md:text-5xl font-serif leading-tight"
              style={{
                fontFamily: theme.fonts.heading,
                color: theme.colors.text.primary,
              }}
            >
              The Art of <br />
              High Perfumery
            </h2>
            <div
              className="w-16 h-[2px]"
              style={{ backgroundColor: theme.colors.primary }}
            />
          </div>

          <div className="space-y-6">
            <p
              className="text-base md:text-lg font-light leading-relaxed"
              style={{ color: theme.colors.text.primary, opacity: 0.9 }}
            >
              Founded in 2026, FRAGO was born from a singular vision: to create
              perfumes that transcend time and evoke deep emotions. We believe
              that a fragrance is more than just a scent; it's an invisible
              accessory, a personal statement, and a vessel for memories.
            </p>
            <p
              className="text-base md:text-lg font-light leading-relaxed"
              style={{ color: theme.colors.text.primary, opacity: 0.9 }}
            >
              Every FRAGO creation is a result of meticulous craftsmanship,
              sourcing the finest natural ingredients from across the globe. Our
              master perfumers blend traditional techniques with modern
              innovation to orchestrate scents that are as complex as they are
              captivating.
            </p>
          </div>

          <div className="pt-4">
            <button
              className="px-8 py-3 text-white text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 hover:bg-green-950 shadow-md"
              style={{ backgroundColor: theme.colors.primary }}
            >
              Explore Our Philosophy
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
