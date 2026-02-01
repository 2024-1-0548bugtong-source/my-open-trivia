"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Question } from '@/types';
import { htmlDecode } from '@/utils/htmlDecode';

type QuestionsProps = {
  categoryId?: string;
};

export default function Questions({ categoryId }: QuestionsProps) {
  const id = categoryId;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async (categoryId: string) => {
    try {
      const res = await axios.get(`https://opentdb.com/api.php?amount=10&category=${categoryId}`);
      setQuestions(res.data.results || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchQuestions(id);
    } else {
      setQuestions([]);
      setLoading(false);
    }
  }, [id]);

  if (loading) return <h3 className="p-6 text-lg">Loading questions...</h3>;
  if (!id) return <h3 className="p-6 text-lg">No category selected.</h3>;
  if (questions.length === 0) return <h3 className="p-6 text-lg">No questions found.</h3>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Questions</h1>

      <div className="flex flex-col gap-4">
        {questions.map((q, index) => (
          <Card key={index} className="p-4">
            <CardContent>
              <p
                className="font-semibold"
                dangerouslySetInnerHTML={{ __html: htmlDecode(q.question) }}
              />

              <div className="mt-2 flex flex-col gap-2">
                {[...q.incorrect_answers, q.correct_answer].map((opt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full text-left"
                    dangerouslySetInnerHTML={{ __html: htmlDecode(opt) }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
