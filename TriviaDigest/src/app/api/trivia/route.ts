import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function GET(req: NextRequest) {
  const { supabase } = createClient(req);

  // The caller's local calendar date (so each user's "today" unlocks at their own
  // midnight, not the server's). Falls back to the server's UTC date if missing/invalid.
  const dateParam = req.nextUrl.searchParams.get('date');
  const utcToday = new Date().toISOString().split('T')[0];
  const today = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
    ? dateParam
    : utcToday;

  const maxAllowedDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  if (today > maxAllowedDate) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  // Never send `correct_index` to the client — the answer must stay server-side,
  // otherwise the game can be trivially beaten by reading the network response.
  const { data: question, error } = await supabase
    .from('trivia_questions')
    .select('question, options, category')
    .eq('date', today)
    .order('order', { ascending: true, nullsFirst: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!question) {
    return NextResponse.json({ error: 'No question found for today' }, { status: 404 });
  }

  return NextResponse.json(question);
} 