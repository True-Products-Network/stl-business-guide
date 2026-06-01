import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('integration_configs')
      .select('config_value')
      .eq('config_key', 'google_maps_api_key')
      .single();

    if (error || !data?.config_value) {
      return NextResponse.json({ key: null }, { status: 404 });
    }

    return NextResponse.json({ key: data.config_value });
  } catch (error) {
    console.error('Error fetching Google Maps API key:', error);
    return NextResponse.json({ key: null }, { status: 500 });
  }
}
