import { Outlet } from "react-router-dom";
import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";
import GoToTop from "../components/global/GoToTop";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main className="pt-[140px] md:pt-[148px] min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <GoToTop />
    </>
  );
};

export default MainLayout;
