import { ArrowRight } from "lucide-react";
import story from "../../assets/home/story.png";

const BrandStory = () => {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Image Side */}
          <div className="w-full md:w-1/2 relative">
            <div className="relative z-10 aspect-[4/5] overflow-hidden">
              <img
                src={story}
                alt="Perfumer at work"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            {/* Artistic Decoration */}
            <div className="absolute top-10 -left-10 w-40 h-40 bg-[#FAF6F3] -z-0"></div>
            <div className="absolute -bottom-6 -right-6 md:-right-12 w-32 md:w-64 h-32 md:h-64 border border-gray-100 -z-0"></div>
          </div>

          {/* Text Side */}
          <div className="w-full md:w-1/2 space-y-8">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">
                Our Heritage
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-medium text-gray-900 leading-[1.2]">
                Crafting Scents That <br />
                <span className="italic font-light">Tell Your Story</span>
              </h2>
            </div>

            <p className="text-gray-500 font-light leading-relaxed text-sm md:text-lg max-w-lg">
              Since 2025, Frago has been dedicated to the art of fine perfumery.
              We source the rarest ingredients from across the globe to create
              fragrances that are not just scents, but emotional journeys. Our
              master perfumers blend traditional techniques with modern
              innovation.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <h4 className="text-2xl font-serif text-green-900 mb-1">
                  100%
                </h4>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">
                  Natural Origins
                </p>
              </div>
              <div>
                <h4 className="text-2xl font-serif text-green-900 mb-1">50+</h4>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">
                  Unique Notes
                </p>
              </div>
            </div>

            <button className="flex items-center space-x-3 group text-gray-900 font-medium tracking-widest text-xs uppercase pt-4 transition-all hover:text-green-900">
              <span>Read Our Full Story</span>
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-2"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
