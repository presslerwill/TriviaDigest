import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function POST(req: NextRequest) {
  const { supabase } = createClient(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { date, questionIndex, selectedIndex } = (body ?? {}) as {
    date?: unknown;
    questionIndex?: unknown;
    selectedIndex?: unknown;
  };

  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  if (typeof questionIndex !== 'number' || !Number.isInteger(questionIndex) || questionIndex < 0) {
    return NextResponse.json({ error: 'Invalid question index' }, { status: 400 });
  }

  if (typeof selectedIndex !== 'number' || !Number.isInteger(selectedIndex) || selectedIndex < 0) {
    return NextResponse.json({ error: 'Invalid selected index' }, { status: 400 });
  }

  // Fetch only the single question at this position, in the same order the
  // client received them from /api/trivia. The correct index for a question
  // is only ever revealed here, after the user has already committed an
  // answer to it, so this can't be used to peek at upcoming answers.
  const { data: questions, error } = await supabase
    .from('trivia_questions')
    .select('correct_index')
    .eq('date', date)
    .order('order', { ascending: true, nullsFirst: false })
    .range(questionIndex, questionIndex);

  if (error) {
    console.error('check-answer fetch error:', error);
    return NextResponse.json({ error: 'Could not check answer' }, { status: 500 });
  }

  const question = questions?.[0] as { correct_index: number } | undefined;

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  return NextResponse.json({
    correct: selectedIndex === question.correct_index,
    correctIndex: question.correct_index,
  });
}
