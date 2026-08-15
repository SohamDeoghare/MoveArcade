import HeroSection from "../features/home/components/HeroSection";
import HowItWorks from "../features/home/components/HowItWorks";
import FeaturedGames from "../features/home/components/FeaturedGames";
import CTASection from "../features/home/components/CTASection";

function HomePage() {
  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <FeaturedGames />
      <CTASection />
    </main>
  );
}

export default HomePage;