import { notFound } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ListingContent from './ListingContent';
import { getBusinessBySlug } from '@/lib/supabase';

interface ListingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <ListingContent business={business} />
      <Footer />
    </main>
  );
}
