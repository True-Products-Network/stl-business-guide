import { notFound } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ListingContent from './ListingContent';
import { getBusinessBySlug } from '@/lib/supabase';

// Force dynamic rendering to avoid static generation issues with Supabase
export const dynamic = 'force-dynamic';

interface ListingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;
  
  let business;
  try {
    business = await getBusinessBySlug(slug);
  } catch (error) {
    console.error('Error fetching business:', error);
    notFound();
  }

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
