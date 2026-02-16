import ContactHero from "../components/contact/ContactHero";
import ContactInfo from "../components/contact/ContactInfo";
import ContactForm from "../components/contact/ContactForm";
import { theme } from "../styles/theme";

const ContactUsPage = () => {
  return (
    <div className="w-full bg-white pb-24">
      <ContactHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-20">
        <div className="flex flex-col lg:flex-row gap-20 lg:gap-32">
          {/* Left Column: Contact Info & Map Placeholder */}
          <div className="flex-1 space-y-16">
            <div className="space-y-4">
              <h2
                className="text-3xl md:text-4xl font-serif"
                style={{
                  fontFamily: theme.fonts.heading,
                  color: theme.colors.text.primary,
                }}
              >
                Visit Our Boutique
              </h2>
              <div
                className="w-16 h-[2px]"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <p className="text-gray-600 font-light leading-relaxed max-w-md">
                Experience our full collection in person at our flagship store.
                Our fragrance experts are ready to guide you.
              </p>
            </div>

            <ContactInfo />

            {/* Google Map Placeholder / Image of store */}
            <div className="w-full aspect-video bg-gray-100 rounded-sm overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-inner group">
              <img
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800"
                alt="FRAGO Boutique"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="flex-1">
            <div
              className="p-8 md:p-12 border border-solid border-gray-100 shadow-2xl relative"
              style={{ backgroundColor: "white" }}
            >
              <div className="mb-10 text-center lg:text-left">
                <h2
                  className="text-3xl font-serif mb-4"
                  style={{
                    fontFamily: theme.fonts.heading,
                    color: theme.colors.text.primary,
                  }}
                >
                  Message Us
                </h2>
                <p className="text-gray-500 text-sm font-light uppercase tracking-widest">
                  Expect a response within 24 hours
                </p>
              </div>

              <ContactForm />

              {/* Decorative corner */}
              <div
                className="absolute -bottom-1 -right-1 w-12 h-12 -z-10"
                style={{ backgroundColor: theme.colors.primary, opacity: 0.1 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
