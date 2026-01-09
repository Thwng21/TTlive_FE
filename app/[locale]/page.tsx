import { HeroSection } from '@/components/features/home/HeroSection';
import { BackgroundBlobs } from '@/components/layout/BackgroundBlobs';
import { Footer } from '@/components/layout/Footer';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

export default function Home() {
  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <BackgroundBlobs />
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-7xl mx-auto">
        <HeroSection />
      </main>
      <Footer />
    </>
  );
}
