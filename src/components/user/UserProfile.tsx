"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader, User as UserIcon } from "lucide-react";

// Consistent icon props
const iconProps = { size: 20, strokeWidth: 2 } as const;
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from "firebase/auth";

export default function UserProfile() {
  const { user, getDisplayName, refreshUser } = useAuth();
  const { toast } = useToast();
  const currentNickname = getDisplayName();

  // Nickname editing state
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(currentNickname);
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [nicknameMessage, setNicknameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Handle nickname save
  const handleSaveNickname = async () => {
    const trimmed = newNickname.trim();

    if (!trimmed) {
      setNicknameMessage({ type: "error", text: "Nickname cannot be empty" });
      return;
    }

    if (trimmed.length < 2) {
      setNicknameMessage({ type: "error", text: "Nickname must be at least 2 characters" });
      return;
    }

    if (trimmed.length > 30) {
      setNicknameMessage({ type: "error", text: "Nickname must be at most 30 characters" });
      return;
    }

    if (trimmed === currentNickname) {
      setNicknameMessage({ type: "error", text: "New nickname must be different" });
      return;
    }

    if (!auth.currentUser) {
      setNicknameMessage({ type: "error", text: "You must be logged in to update nickname" });
      return;
    }

    setIsSavingNickname(true);
    try {
      // Update Firebase Auth displayName
      await updateProfile(auth.currentUser, {
        displayName: trimmed
      });
      
      // Force reload and refresh auth context to get updated user object
      await refreshUser();
      
      setNicknameMessage({ type: "success", text: "Nickname updated successfully!" });
      setIsEditingNickname(false);
      setNewNickname(trimmed);

      toast({
        title: "Nickname Updated",
        description: `Your display name has been changed to "${trimmed}"`,
      });

      // Reset message after 3 seconds
      setTimeout(() => setNicknameMessage(null), 3000);
    } catch (error) {
      setNicknameMessage({
        type: "error",
        text: `Failed to update nickname: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsSavingNickname(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "Please fill in all password fields" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Current password is required" });
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error("User not authenticated");
      }

      // Reauthenticate with current password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);

      // Reset message after 3 seconds
      setTimeout(() => setPasswordMessage(null), 3000);

      toast({ description: "Password updated successfully" });
    } catch (error) {
      let errorText = "Failed to change password";
      if (error instanceof Error) {
        if (error.message.includes("wrong-password")) {
          errorText = "Current password is incorrect";
        } else if (error.message.includes("weak-password")) {
          errorText = "New password is too weak";
        } else if (error.message.includes("requires-recent-login")) {
          errorText = "Please sign out and login again for security";
        } else {
          errorText = error.message;
        }
      }
      setPasswordMessage({ type: "error", text: errorText });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Profile Settings</CardTitle>
          <CardDescription className="text-sm">Manage your account information and security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Nickname Edit Section */}
          <div className="space-y-4 pb-6 border-b">
            <div>
              <Label className="text-base font-semibold">Nickname</Label>
              <p className="text-sm text-muted-foreground mt-1">Your display name on the leaderboard</p>
            </div>

            {!isEditingNickname ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon size={18} className="text-muted-foreground" />
                  <div className="text-lg font-medium">{currentNickname}</div>
                </div>
                <Button variant="outline" onClick={() => setIsEditingNickname(true)}>
                  Edit Nickname
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Enter new nickname"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  maxLength={30}
                  disabled={isSavingNickname}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveNickname}
                    disabled={isSavingNickname}
                    className="flex-1"
                  >
                    {isSavingNickname ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Nickname"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingNickname(false);
                      setNewNickname(currentNickname);
                      setNicknameMessage(null);
                    }}
                    disabled={isSavingNickname}
                  >
                    Cancel
                  </Button>
                </div>

                {nicknameMessage && (
                  <div
                    className={`flex items-start gap-2 p-3 rounded-lg ${
                      nicknameMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300"
                        : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300"
                    }`}
                  >
                    {nicknameMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm">{nicknameMessage.text}</span>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> Changing your nickname won't update old leaderboard records. New quizzes will appear under your new nickname.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Password Change Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Password & Security</Label>
              <p className="text-sm text-muted-foreground mt-1">Change your password to keep your account secure</p>
            </div>

            {!isChangingPassword ? (
              <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                Change Password
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm">
                    Current Password
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isSubmittingPassword}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSubmittingPassword}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmittingPassword}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={isSubmittingPassword}
                    className="flex-1"
                  >
                    {isSubmittingPassword ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordMessage(null);
                    }}
                    disabled={isSubmittingPassword}
                  >
                    Cancel
                  </Button>
                </div>

                {passwordMessage && (
                  <div
                    className={`flex items-start gap-2 p-3 rounded-lg ${
                      passwordMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300"
                        : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300"
                    }`}
                  >
                    {passwordMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm">{passwordMessage.text}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
