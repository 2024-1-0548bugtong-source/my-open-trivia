"use client";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserProfile from "@/components/user/UserProfile";
import MyScores from "@/components/user/MyScores";
import { User as UserIcon, Settings, BarChart3, Clock, Copy, Trophy, TrendingUp, Heart, Mail, Lock } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { Surface } from "@/components/ui/surface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/panel";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from "firebase/auth";

export default function UserPage() {
  const { getDisplayName, user, refreshUser } = useAuth();
  const { toast } = useToast();
  const displayName = getDisplayName();

  // Edit states
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(displayName);
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [nicknameMessage, setNicknameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Motivational messages
  const motivationMessages = [
    "🧠 Your brain is doing push-ups. Keep going!",
    "⚡ Your curiosity called... it wants more trivia.",
    "📚 Tiny facts today, big brain tomorrow.",
    "🎯 You're on a trivia streak! Don't break the chain.",
    "🌟 Smart people read this. You're smart.",
    "🚀 Knowledge is power. You're getting powerful.",
    "💡 Your brain cells are high-fiving each other.",
    "🏆 Trivia champions start somewhere. This is it.",
    "🎪 Life's a circus, but at least you know facts about it.",
    "🌈 Every question makes you 0.1% more awesome.",
    "🔥 You're on fire! (Metaphorically. Please stay hydrated.)",
    "📖 Reading this makes you smarter. You're welcome."
  ];

  const [motivationMessage, setMotivationMessage] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationMessages.length);
    setMotivationMessage(motivationMessages[randomIndex]);
    setNewNickname(displayName);
  }, [displayName]);

  // Nickname handlers
  const handleSaveNickname = async () => {
    if (!user || !newNickname.trim()) {
      setNicknameMessage({ type: "error", text: "Nickname cannot be empty" });
      return;
    }
    
    if (newNickname.length > 30) {
      setNicknameMessage({ type: "error", text: "Nickname must be 30 characters or less" });
      return;
    }
    
    setIsSavingNickname(true);
    try {
      await updateProfile(user, { displayName: newNickname });
      refreshUser();
      setNicknameMessage({ type: "success", text: "Nickname updated successfully" });
      setTimeout(() => {
        setIsEditingNickname(false);
        setNicknameMessage(null);
      }, 1500);
    } catch (error) {
      setNicknameMessage({ type: "error", text: "Failed to update nickname" });
    } finally {
      setIsSavingNickname(false);
    }
  };

  // Email handlers
  const handleSaveEmail = async () => {
    if (!user || !user.email) return;
    
    if (!newEmail.trim() || !emailPassword.trim()) {
      setEmailMessage({ type: "error", text: "All fields are required" });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }
    
    setIsSavingEmail(true);
    try {
      if (user) {
        const credential = EmailAuthProvider.credential(user.email, emailPassword);
        await reauthenticateWithCredential(user, credential);
        await handleSaveEmail();
        refreshUser();
        setEmailMessage({ type: 'success', text: 'Email updated successfully!' });
        setIsChangingEmail(false);
        toast({ description: "Email updated successfully" });
      }
    } catch (error) {
      setEmailMessage({ type: 'error', text: 'Failed to update email' });
      toast({ description: "Failed to update email", variant: "destructive" });
    } finally {
      setIsSavingEmail(false);
    }
  };

  // Password handlers
  const handlePasswordChange = async () => {
    if (!user || !user.email || !currentPassword || !newPassword || newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Please fill all fields and ensure passwords match" });
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }
    
    setIsSubmittingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      setPasswordMessage({ type: "success", text: "Password updated successfully" });
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordMessage(null);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1500);
    } catch (error) {
      setPasswordMessage({ type: "error", text: "Failed to update password. Please check your current password." });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ProtectedRoute>
      <Surface variant="page">
        <div className="max-w-screen-xl mx-auto px-8 py-6">
          {/* HERO / WELCOME CARD - Reduced height ~200px */}
          <div className="bg-gradient-to-r from-violet-100 via-purple-50 to-indigo-100 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-indigo-950/15 rounded-2xl shadow-lg relative overflow-hidden mb-8" style={{ minHeight: '200px' }}>
            <div className="absolute inset-0 opacity-20 dark:opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200 dark:bg-violet-800 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-200 dark:bg-purple-800 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
            </div>
            
            <div className="relative z-10 flex items-center justify-center h-full px-8 py-6">
              <div className="flex items-center gap-4 text-center">
                {/* Profile icon */}
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-violet-200 dark:border-violet-700 shadow-lg">
                  <UserIcon size={24} strokeWidth={2} className="text-violet-600 dark:text-violet-400" />
                </div>
                
                {/* Welcome text */}
                <div className="text-left">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Welcome back, {displayName}!
                  </h1>
                  {motivationMessage && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                      {motivationMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION HEADER */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Account Settings</h2>
          </div>

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 space-y-6 lg:space-y-0">
            {/* Row 1: LEFT - Nickname Card */}
            <Card className="shadow-sm dark:shadow-none border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Nickname</CardTitle>
                  {!isEditingNickname && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingNickname(true)}>
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {isEditingNickname ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Nickname</Label>
                      <Input
                        id="nickname"
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        placeholder="Enter your nickname"
                        maxLength={30}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveNickname} disabled={isSavingNickname}>
                        {isSavingNickname ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsEditingNickname(false)}>
                        Cancel
                      </Button>
                    </div>
                    {nicknameMessage && (
                      <p className={`text-sm ${nicknameMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {nicknameMessage.text}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-lg">{newNickname}</p>
                        <p className="text-sm text-muted-foreground">Your display name</p>
                      </div>
                    </div>
                    {/* Account metadata */}
                    <div className="space-y-2 pt-4 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Account created:</span>
                        <span>{user?.metadata?.creationTime ? formatDate(user.metadata.creationTime) : 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last sign-in:</span>
                        <span>{user?.metadata?.lastSignInTime ? formatDate(user.metadata.lastSignInTime) : 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Row 1: RIGHT - Email/Password Card */}
            <Card className="shadow-sm dark:shadow-none border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg font-semibold">Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsChangingEmail(true)}>
                      Change Email
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </p>
                      <p className="text-sm text-muted-foreground">•••••••••</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: FULL WIDTH - My Stats */}
          <Card className="shadow-sm dark:shadow-none border-border">
            <CardHeader className="pb-4">
              <Panel variant="warning" icon={BarChart3} title="My Stats">
                Track your quiz performance and achievements
              </Panel>
            </CardHeader>
            <CardContent className="pt-2">
              <MyScores showStatsOnly={true} />
            </CardContent>
          </Card>

          {/* YOUR ACTIVITY SECTION - REFERENCE LAYOUT */}
          <div className="mt-8">
            {/* SECTION HEADER: Your Activity */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Your Activity</h2>
              <p className="text-muted-foreground">Track your recent quizzes and favorite content</p>
            </div>

            {/* 2-COLUMN GRID: Recent Activity | Favorites */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT: Recent Activity — rendered inside MyScores */}
              {/* RIGHT: Favorites — rendered inside MyScores */}
              <MyScores showActivityOnly={true} />
            </div>
          </div>

          {/* Email Change Modal */}
          {isChangingEmail && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle>Change Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">New Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-password">Current Password</Label>
                    <Input
                      id="email-password"
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEmail} disabled={!newEmail || !emailPassword || isSavingEmail}>
                      {isSavingEmail ? "Updating..." : "Update Email"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsChangingEmail(false)}>
                      Cancel
                    </Button>
                  </div>
                  {emailMessage && (
                    <p className={`text-sm ${emailMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {emailMessage.text}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Password Change Modal */}
          {isChangingPassword && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handlePasswordChange} disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || isSubmittingPassword}>
                      {isSubmittingPassword ? "Updating..." : "Update Password"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                      Cancel
                    </Button>
                  </div>
                  {passwordMessage && (
                    <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordMessage.text}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Surface>
    </ProtectedRoute>
  );
}
