import HeroSlider from "../components/home/HeroSlider";
import Features from "../components/home/Features";
import Collections from "../components/home/Collections";
import FeaturedProducts from "../components/home/FeaturedProducts";
import BrandStory from "../components/home/BrandStory";
import Newsletter from "../components/home/Newsletter";
import Background from "../components/home/Background";

const HomePage = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Entrance */}
      <HeroSlider />

      {/* Core Values / USPs */}
      <Features />

      {/* Background */}
      <Background />

      {/* Category Navigation */}
      <Collections />

      {/* Product Showcase */}
      <FeaturedProducts />

      {/* Brand Identity */}
      <BrandStory />

      {/* Engagement */}
      <Newsletter />
    </div>
  );
};

export default HomePage;
