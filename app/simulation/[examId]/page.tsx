'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ActiveExam, CBTExamScreen, ExamError, ExamLoading } from '@/components/cbt/CBTExamScreen';

export default function ActiveExamPage() {
  const params = useParams<{ examId: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<ActiveExam | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadExam() {
      try {
        const response = await fetch(`/api/exams/${encodeURIComponent(params.examId)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (response.status === 401) {
          router.replace('/login');
          return;
        }
        if (!response.ok) {
          setError('This examination is unavailable or is no longer active. Return to exam selection and start a new one.');
          return;
        }

        const data: { exam: ActiveExam } = await response.json();
        setExam(data.exam);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === 'AbortError') return;
        setError('Please return to exam selection and try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadExam();
    return () => controller.abort();
  }, [params.examId, router]);

  if (loading) return <ExamLoading />;
  if (error || !exam) {
    return <ExamError message={error || 'Unable to load this examination. Please return to exam selection and try again.'} />;
  }

  return <CBTExamScreen exam={exam} />;
}
