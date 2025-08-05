import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function GET(req: NextRequest) {
  const { supabase } = createClient(req);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const { data: question, error } = await supabase
    .from('trivia_questions')
    .select('*')
    .eq('date', today)
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!question) {
    return NextResponse.json({ error: 'No question found for today' }, { status: 404 });
  }

  return NextResponse.json(question);
} 