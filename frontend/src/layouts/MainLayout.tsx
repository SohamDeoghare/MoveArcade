import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-[#08090d] text-white">
      <Navbar />

      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;