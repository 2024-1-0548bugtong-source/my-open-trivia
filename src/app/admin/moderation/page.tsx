"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { getFunctions } from "firebase/functions";
import { app } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, Shield, AlertTriangle, CheckCircle, User, Gavel } from "lucide-react";
import { toast } from "sonner";

interface ModerationResult {
  ok: boolean;
  message?: string;
  error?: string;
}

export default function AdminModeration() {
  const [targetUid, setTargetUid] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ModerationResult | null>(null);

  const functions = getFunctions(app);

  const handleModerateNickname = async () => {
    // Validation
    if (!targetUid.trim()) {
      toast.error("Please enter a target UID");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for moderation");
      return;
    }

    if (targetUid.length < 20) {
      toast.error("Invalid UID format. UIDs are typically longer strings.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const moderateNickname = httpsCallable(functions, 'moderateNickname');
      
      const response = await moderateNickname({
        targetUid: targetUid.trim(),
        reason: reason.trim()
      });

      const moderationResult = response.data as ModerationResult;
      setResult(moderationResult);

      if (moderationResult.ok) {
        toast.success("Nickname moderation completed successfully");
        // Clear form on success
        setTargetUid("");
        setReason("");
      } else {
        toast.error(moderationResult.error || "Moderation failed");
      }
    } catch (error: any) {
      console.error("Moderation error:", error);
      const errorMessage = error.message || "Failed to moderate nickname";
      setResult({
        ok: false,
        error: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gavel className="w-6 h-6 text-red-500" />
          Nickname Moderation
        </h2>
        <p className="text-muted-foreground">
          Force rename offensive nicknames • Minimal safe power • Audit logged
        </p>
      </div>

      {/* Security Warning */}
      <Alert className="border-orange-200 bg-orange-50/50">
        <Shield className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>⚠️ Admin Privilege Required:</strong> This action uses Firebase Cloud Functions with Admin SDK.
          Only users with <code>role: "admin"</code> custom claim can perform this action.
          All moderation actions are logged to adminAudit collection.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Moderation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Moderate User Nickname
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="targetUid" className="block text-sm font-medium mb-2">
                Target User UID
              </label>
              <Input
                id="targetUid"
                type="text"
                placeholder="Enter user UID (e.g., abc123xyz789...)"
                value={targetUid}
                onChange={(e) => setTargetUid(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the Firebase Auth UID of the user to moderate
              </p>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-2">
                Reason for Moderation
              </label>
              <Textarea
                id="reason"
                placeholder="Describe why this nickname needs moderation (e.g., offensive content, inappropriate language, etc.)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This reason will be stored in the audit log
              </p>
            </div>

            <Button 
              onClick={handleModerateNickname}
              disabled={loading || !targetUid.trim() || !reason.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Moderate Nickname
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Action Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              What This Action Does
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">A</Badge>
                <div>
                  <p className="font-medium">Force Rename User</p>
                  <p className="text-sm text-muted-foreground">
                    Updates users/{targetUid || "UID"}.nickname to "Player####" (4 random digits)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">B</Badge>
                <div>
                  <p className="font-medium">Set Reset Flag</p>
                  <p className="text-sm text-muted-foreground">
                    Sets users/{targetUid || "UID"}.needsNicknameReset = true
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">C</Badge>
                <div>
                  <p className="font-medium">Mask Leaderboard Entries</p>
                  <p className="text-sm text-muted-foreground">
                    Updates all leaderboard docs with uid == targetUid: nicknameSnapshot = "Moderated", moderated = true
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">D</Badge>
                <div>
                  <p className="font-medium">Write Audit Log</p>
                  <p className="text-sm text-muted-foreground">
                    Creates entry in adminAudit collection with actorUid, actionType, targetUid, reason, and timestamps
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 text-sm">🔒 Security Notes</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Uses Firebase Cloud Functions with Admin SDK</p>
                <p>• Client has NO direct write access to user docs</p>
                <p>• Client has NO direct write access to leaderboard docs</p>
                <p>• Requires admin custom claim verification</p>
                <p>• All actions are logged and auditable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Display */}
      {result && (
        <Card className={result.ok ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {result.ok ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Moderation Successful</h4>
                    <p className="text-green-800 text-sm">
                      {result.message || "User nickname has been moderated successfully."}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-semibold text-red-900">Moderation Failed</h4>
                    <p className="text-red-800 text-sm">
                      {result.error || "An error occurred during moderation."}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Details */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-900">📋 Cloud Function Details</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-3">
          <div>
            <h4 className="font-semibold mb-1">Function Name:</h4>
            <code className="text-sm bg-blue-100 px-2 py-1 rounded">moderateNickname</code>
          </div>
          
          <div>
            <h4 className="font-semibold mb-1">Payload:</h4>
            <pre className="text-sm bg-blue-100 p-3 rounded overflow-x-auto">
{`{
  "targetUid": "string",
  "reason": "string"
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Response:</h4>
            <pre className="text-sm bg-blue-100 p-3 rounded overflow-x-auto">
{`{
  "ok": boolean,
  "message": "string (optional)",
  "error": "string (optional)"
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Security Checks:</h4>
            <ul className="text-sm space-y-1">
              <li>• Verify context.auth exists</li>
              <li>• Verify context.auth.token.role == "admin"</li>
              <li>• Validate targetUid format</li>
              <li>• Generate safe random nickname</li>
              <li>• Use transactions for data consistency</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
