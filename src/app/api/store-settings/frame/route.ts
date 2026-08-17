import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Public, unauthenticated — only the homepage's FrameEffectSlider calls
// this. Split out from /api/store-settings so every other page on the site
// stops paying for these two base64 images (~150KB combined) on every load.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('frame_effect_before_image, frame_effect_after_image')
      .eq('id', 1)
      .single();
    if (error) throw error;
    return NextResponse.json(
      {
        success: true,
        settings: {
          frameEffectBeforeImage: data?.frame_effect_before_image ?? '',
          frameEffectAfterImage: data?.frame_effect_after_image ?? '',
        },
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } }
    );
  } catch (error) {
    console.error('GET /api/store-settings/frame error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load frame settings' }, { status: 500 });
  }
}
