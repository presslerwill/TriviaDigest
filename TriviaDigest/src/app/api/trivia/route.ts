import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function GET(req: NextRequest) {
  const { supabase } = createClient(req);

  const today = new Date().toISOString().split('T')[0];

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