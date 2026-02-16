import { Zap, ShieldCheck, Leaf } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} />,
      title: "Fastest Delivery",
      description: "Fastest delivery to your doorstep",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} />,
      title: "Fragrance Fresh",
      description: "Original scent from our best collection",
    },
    {
      icon: <Leaf className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} />,
      title: "Total Quality",
      description: "Premium & long lasting fragrance brand",
    },
  ];

  return (
    <section className="bg-[#FAF6F3] py-16 px-4 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-4 group transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-gray-800 transition-colors duration-300 group-hover:text-green-900">
                {feature.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg md:text-xl font-serif font-medium text-gray-900 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-500 font-light max-w-[250px] mx-auto">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
