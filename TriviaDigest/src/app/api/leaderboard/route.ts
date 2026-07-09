import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date');

  const { data, error } = await supabase
    .from('trivia_scores')
    .select('*')
    .eq('date', date)
    .order('score', { ascending: false })
    .order('time', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
