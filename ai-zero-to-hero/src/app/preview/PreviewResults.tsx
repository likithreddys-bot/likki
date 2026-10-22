'use client';
import { QuizResults } from '@/components/quiz/QuizResults';
import type { FinalQuizResult } from '@/lib/types';

export function PreviewResults({ result, topicTitle }: { result: FinalQuizResult; topicTitle: string }) {
  return <QuizResults result={result} slug="how-ai-models-work" topicTitle={topicTitle} passPercent={70} onRetake={() => {}} />;
}
