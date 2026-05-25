import { Suspense } from 'react';
import PricingContent from './PricingContent';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Loader2 } from 'lucide-react';

function LoadingState() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-[#54afe6]" />
      </div>
      <Footer />
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PricingContent />
    </Suspense>
  );
}
