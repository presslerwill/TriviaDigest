import { createClient } from '../../../utils/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { supabase } = createClient(req);
  const body = await req.json();
  const { username, score } = body;

  const { error } = await supabase.from('trivia_scores').insert([
    { username, score },
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}