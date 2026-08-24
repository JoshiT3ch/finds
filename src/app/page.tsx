import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryBrowse from '@/components/CategoryBrowse';
import FeaturedFinds from '@/components/FeaturedFinds';
import SellingSection from '@/components/SellingSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CategoryBrowse />
      <FeaturedFinds />
      <SellingSection />
      <Footer />
    </div>
  );
}
