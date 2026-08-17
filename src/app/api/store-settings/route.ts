import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { settingsFromDb } from '@/lib/supabaseMappers';

// Public, unauthenticated (outside the /api/admin/* middleware matcher by
// design) — every storefront page's TrackingScripts + PromoBar read this.
// Deliberately column-limited: the `settings` row also holds the two
// frame-effect images (~150KB of base64 each), which only the homepage
// slider needs — see /api/store-settings/frame for those. Selecting '*'
// here meant every page load on the whole site paid for the homepage's
// images.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select(
        'store_name, phone, email, address, inside_dhaka_delivery, outside_dhaka_delivery, promo_notice, promo_bar_items, header_scripts, body_scripts, footer_scripts'
      )
      .eq('id', 1)
      .single();
    if (error) throw error;
    return NextResponse.json(
      { success: true, settings: settingsFromDb(data) },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } }
    );
  } catch (error) {
    console.error('GET /api/store-settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load settings' }, { status: 500 });
  }
}
