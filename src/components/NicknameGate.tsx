"use client";

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NicknameGateProps {
  children: React.ReactNode;
}

export default function NicknameGate({ children }: NicknameGateProps) {
  const user = useUser();
  const nickname = user?.nickname;
  const login = user?.login;
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (login) {
        login(inputValue);
        setInputValue('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (login) {
        login('Guest');
        setInputValue('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to continue as guest');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && inputValue.trim()) {
      handleLogin();
    }
  };

  // If logged in, show the app
  if (nickname) {
    return <>{children}</>;
  }

  // If not logged in, show the nickname prompt
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-muted/50">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary mb-2">
            Open Trivia
          </CardTitle>
          <CardDescription className="text-base">
            Enter your name to start the quiz
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-sm font-medium">
              Your Name
            </Label>
            <Input
              id="nickname"
              type="text"
              placeholder="Enter your name (2-30 characters)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              maxLength={30}
              className="text-base"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {inputValue.length > 0 ? (
                <>
                  {inputValue.length}/30 characters
                  {inputValue.trim().length >= 2 ? (
                    <span className="text-green-600 ml-2">✓ Valid</span>
                  ) : (
                    <span className="text-amber-600 ml-2">
                      (min 2 characters)
                    </span>
                  )}
                </>
              ) : (
                <>Minimum 2 characters required</>
              )}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              disabled={isLoading || inputValue.trim().length < 2}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <Button
              onClick={handleGuestLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Continue as Guest
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your name will be saved with your quiz results in the leaderboard
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
