import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

// Public, unauthenticated — only the homepage's FrameEffectSlider calls
// this. Split out from /api/store-settings so every other page on the site
// stops paying for these two base64 images (~150KB combined) on every load.
export async function GET() {
  try {
    const data = await queryOne(
      'SELECT frame_effect_before_image, frame_effect_after_image FROM settings WHERE id = 1'
    );
    return NextResponse.json(
      {
        success: true,
        settings: {
          frameEffectBeforeImage: data?.frame_effect_before_image ?? '',
          frameEffectAfterImage: data?.frame_effect_after_image ?? '',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/store-settings/frame error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load frame settings' }, { status: 500 });
  }
}
