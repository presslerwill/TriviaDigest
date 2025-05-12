import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date');

  const { data, error } = await supabase
    .from('trivia_scores')
    .select('*')
    .gte('date', `${date}T00:00:00Z`)
    .lte('date', `${date}T23:59:59Z`)
    .order('score', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
