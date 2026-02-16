import backgroundImage from "../../assets/home/background.png";

const Background = () => {
  return (
    <div className="w-full h-[60vh] relative overflow-hidden group">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-105"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/30 bg-gradient-to-b from-black/50 via-transparent to-black/50"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg text-center tracking-wide animate-fade-in-up">
          Welcome to Frago
        </h1>
        <p className="text-lg md:text-xl font-light text-gray-200 max-w-2xl text-center drop-shadow-md animate-fade-in-up delay-100">
          Experiencing the finest quality and elegance.
        </p>
      </div>
    </div>
  );
};

export default Background;
