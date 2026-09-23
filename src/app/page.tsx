import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturedFinds from '@/components/FeaturedFinds';
import SellingSection from '@/components/SellingSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturedFinds />
      <SellingSection />
      <Footer />
    </div>
  );
}
