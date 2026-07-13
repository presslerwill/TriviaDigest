import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const date = req.nextUrl.searchParams.get('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('trivia_scores')
    .select('*')
    .eq('date', date)
    .order('score', { ascending: false })
    .order('time', { ascending: true });

  if (error) {
    console.error('leaderboard fetch error:', error);
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
  }
  return NextResponse.json(data);
}
