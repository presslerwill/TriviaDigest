import { createClient } from '../../../utils/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';

const MAX_USERNAME_LENGTH = 20;
const POINTS_PER_CORRECT = 1000;

export async function POST(req: NextRequest) {
  const { supabase } = createClient(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { username, answers, timer, date } = (body ?? {}) as {
    username?: unknown;
    answers?: unknown;
    timer?: unknown;
    date?: unknown;
  };

  // --- Validate input. Everything here is attacker-controlled. ---
  if (typeof username !== 'string' || username.trim().length === 0) {
    return NextResponse.json({ error: 'A username is required' }, { status: 400 });
  }
  const cleanUsername = username.trim().slice(0, MAX_USERNAME_LENGTH);

  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  if (typeof timer !== 'number' || !Number.isFinite(timer) || timer < 0) {
    return NextResponse.json({ error: 'Invalid time' }, { status: 400 });
  }

  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
  }

  // --- Fetch the authoritative answers for this date, in the same order the
  //     client received them, and score server-side. The client's notion of
  //     correctness (or score) is never trusted. ---
  const { data: questions, error: questionsError } = await supabase
    .from('trivia_questions')
    .select('correct_index')
    .eq('date', date)
    .order('order', { ascending: true, nullsFirst: false })
    .limit(10);

  if (questionsError) {
    return NextResponse.json({ error: 'Could not score submission' }, { status: 500 });
  }

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: 'No trivia found for that date' }, { status: 404 });
  }

  if (answers.length !== questions.length) {
    return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
  }

  const results = (questions as { correct_index: number }[]).map(
    (q, i) => answers[i] === q.correct_index,
  );
  const correctCount = results.filter(Boolean).length;
  const score = correctCount * POINTS_PER_CORRECT;

  const { error: insertError } = await supabase.from('trivia_scores').insert([
    { username: cleanUsername, score, time: Math.round(timer) },
  ]);

  if (insertError) {
    return NextResponse.json({ error: 'Could not save score' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    score,
    results,
    correctCount,
    total: questions.length,
  });
}
