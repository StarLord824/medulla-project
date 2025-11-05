import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Marquee from '@/components/Marquee';
import UploadCard from '@/components/UploadCard';

export default function Page() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <Header />
      
      <main className="pt-32 pb-16 px-6 flex flex-col items-center justify-center min-h-screen">
        <UploadCard />
        <Marquee />
      </main>

      <Footer />
    </div>
  );
}
