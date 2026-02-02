import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function Preferences() {
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 flex items-center gap-3">
          <Settings size={32} strokeWidth={2} />
          Preferences
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your app settings and defaults.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Appearance</CardTitle>
            <CardDescription className="text-sm">Customize how the app looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dark Mode</Label>
                <div className="text-sm text-muted-foreground">
                  Toggle between light and dark themes.
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                  <SelectTrigger className="w-35">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Font Size</Label>
                <div className="text-sm text-muted-foreground">
                  Adjust the text size for better readability.
                </div>
              </div>
              <Select value={fontSize} onValueChange={(v: any) => setFontSize(v)}>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Gameplay</CardTitle>
            <CardDescription className="text-sm">Configure default settings for your quizzes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
             <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Sound Effects</Label>
                <div className="text-sm text-muted-foreground">
                  Play sounds when answering questions.
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Difficulty</Label>
                <div className="text-sm text-muted-foreground">
                  Standardized to Medium for fair leaderboard scoring.
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Medium</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">(Standard)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button size="lg">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
