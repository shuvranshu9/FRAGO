import AboutHero from "../../components/about/AboutHero";
import StorySection from "../../components/about/StorySection";
import ValuesSection from "../../components/about/ValuesSection";

const AboutUsPage = () => {
  return (
    <div className="w-full">
      <AboutHero />
      <StorySection />
      <ValuesSection />

      {/* Call to Action Section */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-serif mb-8 text-gray-900">
            Experience the Essence
          </h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto font-light lg:text-lg">
            Join thousands of others who have found their signature scent with
            FRAGO.
          </p>
          <button className="px-10 py-4 bg-[#2f5e3a] text-white text-xs uppercase tracking-[0.2em] hover:bg-green-950 transition-all shadow-lg">
            Shop the Collection
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
