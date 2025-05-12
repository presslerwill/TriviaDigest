import { supabase } from '../../lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('trivia_questions')
    .select('*')
    .eq('date', today)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}