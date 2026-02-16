import { theme } from "../../styles/theme";

const ValuesSection = () => {
  const values = [
    {
      id: 1,
      title: "Craftsmanship",
      description:
        "Meticulously blended by master perfumers using time-honored techniques.",
      icon: "✨",
    },
    {
      id: 2,
      title: "Ethical Sourcing",
      description:
        "Sustainability is at our core, sourcing only the finest eco-conscious ingredients.",
      icon: "🌿",
    },
    {
      id: 3,
      title: "Timeless Elegance",
      description:
        "Scents designed to last not just on the skin, but in the memory of those you encounter.",
      icon: "⌛",
    },
  ];

  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-12"
      style={{ backgroundColor: theme.colors.surface }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2
            className="text-3xl md:text-4xl font-serif"
            style={{
              fontFamily: theme.fonts.heading,
              color: theme.colors.text.primary,
            }}
          >
            Our Core Values
          </h2>
          <p
            className="text-sm md:text-base font-light max-w-xl mx-auto uppercase tracking-widest"
            style={{ color: theme.colors.text.secondary, opacity: 0.7 }}
          >
            What defines the FRAGO experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          {values.map((value) => (
            <div key={value.id} className="text-center group">
              <div
                className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundColor: "white", shadow: theme.shadows.md }}
              >
                <span className="text-2xl">{value.icon}</span>
              </div>
              <h3
                className="text-xl font-serif mb-4"
                style={{
                  fontFamily: theme.fonts.heading,
                  color: theme.colors.text.primary,
                }}
              >
                {value.title}
              </h3>
              <p
                className="text-sm md:text-base font-light leading-relaxed"
                style={{ color: theme.colors.text.primary, opacity: 0.8 }}
              >
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
