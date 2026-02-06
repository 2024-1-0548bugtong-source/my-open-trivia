"use client";

import { createQuizResult } from "../services/quizResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
import { useState } from "react";

export default function FirestoreTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleTestWrite = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      // Test write with identifiable data
      await createQuizResult({
        score: Math.floor(Math.random() * 10) + 1,
        totalQuestions: 10,
        nickname: `Test_${Date.now().toString().slice(-4)}`,
      });
      setMessage("✅ Test write successful! Check Firebase console for 'quizResults' collection.");
      console.log("Firestore test write successful");
    } catch (err) {
      console.error("Firestore error:", err);
      setMessage(
        `❌ Write failed: ${err instanceof Error ? err.message : "Unknown error"}. Check Firestore security rules.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Test Firebase Connection</CardTitle>
              <CardDescription>Click to write test data to Firestore</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTestWrite} className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Writing..." : "Test Firestore Write"}
          </Button>
          {message && (
            <p className={`text-sm text-center ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
          <p className="text-xs text-muted-foreground text-center">
            This creates a test document in the 'quizResults' collection with randomized nickname
          </p>
        </CardContent>
      </Card>
    </div>
  );
}