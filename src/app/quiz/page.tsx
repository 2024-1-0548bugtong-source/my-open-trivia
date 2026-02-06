"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, Play, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Import the QuizPage component from pages directory
import QuizPage from "@/pages/QuizPage";

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<{ id: number; name: string } | null>(null);

  const categoryId = searchParams?.get("category");

  useEffect(() => {
    const loadCategory = async () => {
      if (!categoryId) {
        router.push("/categories");
        return;
      }

      try {
        // Fetch categories to find the matching one
        const response = await fetch("https://opentdb.com/api_category.php");
        const data = await response.json();
        const foundCategory = data.trivia_categories.find(
          (cat: any) => cat.id === parseInt(categoryId)
        );

        if (foundCategory) {
          setCategory(foundCategory);
        } else {
          toast.error("Category not found");
          router.push("/categories");
        }
      } catch (error) {
        console.error("Failed to load category:", error);
        toast.error("Failed to load category");
        router.push("/categories");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategory();
  }, [categoryId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Category not found</p>
              <Button asChild>
                <Link href="/categories">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Categories
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/categories">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Categories
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{category.name}</h1>
              <Badge variant="secondary">Quiz</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <QuizPage />
    </div>
  );
}

export default function QuizRoute() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
