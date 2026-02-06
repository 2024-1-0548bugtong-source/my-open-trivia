"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from "firebase/auth";

export default function UserProfile() {
  const { user, getDisplayName, refreshUser } = useAuth();
  const { toast } = useToast();
  const [currentNickname, setCurrentNickname] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by setting nickname only on client
  useEffect(() => {
    setCurrentNickname(getDisplayName());
    setIsMounted(true);
  }, [getDisplayName]);

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

  // Update newNickname when currentNickname changes (after mount)
  useEffect(() => {
    if (isMounted) {
      setNewNickname(currentNickname);
    }
  }, [currentNickname, isMounted]);

  const handleSaveNickname = async () => {
    if (!user || !newNickname.trim()) return;
    
    setIsSavingNickname(true);
    try {
      await updateProfile(user, { displayName: newNickname });
      refreshUser();
      setNicknameMessage({ type: "success", text: "Nickname updated successfully" });
    } catch (error) {
      setNicknameMessage({ type: "error", text: "Failed to update nickname" });
    } finally {
      setIsSavingNickname(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user || !user.email || !currentPassword || !newPassword || newPassword !== confirmPassword) return;
    
    setIsSubmittingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordMessage({ type: "success", text: "Password updated successfully" });
    } catch (error) {
      setPasswordMessage({ type: "error", text: "Failed to update password" });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isMounted ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      ) : (
        <>
          {/* Nickname Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Nickname</CardTitle>
              <CardDescription className="text-sm">Your display name across the app.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isEditingNickname ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">New Nickname</Label>
                    <Input
                      id="nickname"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      placeholder="Enter new nickname"
                      maxLength={30}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveNickname}
                      disabled={isSavingNickname || !newNickname.trim()}
                      size="sm"
                    >
                      {isSavingNickname ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingNickname(false);
                        setNewNickname(currentNickname);
                        setNicknameMessage(null);
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                  {nicknameMessage && (
                    <div className={`flex items-center gap-2 text-sm ${nicknameMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {nicknameMessage.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      {nicknameMessage.text}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-lg">{currentNickname}</p>
                      <p className="text-sm text-muted-foreground">Current nickname</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingNickname(true)}
                      size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Password</CardTitle>
              <CardDescription className="text-sm">Change your account password.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isChangingPassword ? (
                <div className="space-y-4">
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
                      minLength={6}
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
                      minLength={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={isSubmittingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                      size="sm"
                    >
                      {isSubmittingPassword ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
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
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                  {passwordMessage && (
                    <div className={`flex items-center gap-2 text-sm ${passwordMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {passwordMessage.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      {passwordMessage.text}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsChangingPassword(true)}
                    size="sm"
                  >
                    Change Password
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Info Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Account Information</CardTitle>
              <CardDescription className="text-sm">Your account details and settings.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-foreground">{user?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                  <p className="text-foreground font-mono text-xs">{user?.uid}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                  <p className="text-foreground">
                    {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Sign In</Label>
                  <p className="text-foreground">
                    {user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
