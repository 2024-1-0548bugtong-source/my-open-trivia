"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Monitor, Sun, Type } from "lucide-react";

type FontSize = "small" | "medium" | "large" | "extra-large";

export default function AdminPreferencesPage() {
  const [fontSize, setFontSize] = useState<FontSize>("medium");

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem("admin_fontSize") as FontSize;
    
    if (savedFontSize) setFontSize(savedFontSize);
    
    // Force light mode
    const root = document.documentElement;
    root.classList.remove("theme-dark");
    root.classList.add("theme-light");
    localStorage.setItem("admin_theme", "light");
  }, []);

  // Apply font size changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing font size classes
    root.classList.remove("font-sm", "font-md", "font-lg", "font-xl");
    
    // Map font size to CSS classes
    const fontClassMap = {
      "small": "font-sm",
      "medium": "font-md", 
      "large": "font-lg",
      "extra-large": "font-xl"
    };
    
    // Add new font size class
    root.classList.add(fontClassMap[fontSize]);
    
    localStorage.setItem("admin_fontSize", fontSize);
  }, [fontSize]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Enhanced Preferences Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-lg border border-indigo-100/50 p-8 relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-200/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
            </div>
            
            <div className="relative z-10 flex items-center gap-6">
              {/* Enhanced Avatar */}
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl border-2 border-white/50">
                <Settings size={32} strokeWidth={2} className="text-white" />
              </div>
              
              {/* Enhanced Welcome Message */}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Admin Preferences
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage admin-specific display and accessibility settings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Appearance Settings */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
            {/* Enhanced Card Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-indigo-100/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Monitor className="text-white" size={24} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Appearance Settings</h2>
                  <p className="text-gray-600 mt-1">Customize how the admin panel looks and feels</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8 space-y-8">
              {/* Enhanced Theme Section */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                        <Sun size={20} strokeWidth={2} className="text-white" />
                      </div>
                      <div>
                        <Label className="text-lg font-bold text-gray-900">Theme Mode</Label>
                        <div className="text-sm text-gray-600">
                          Admin panel is optimized for light mode visibility
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-3 bg-white border border-amber-200 rounded-xl shadow-sm">
                      <Sun size={18} strokeWidth={2} className="text-amber-500" />
                      <span className="text-base font-semibold text-gray-900">Light Mode</span>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg" />
                  </div>
                </div>
              </div>

              {/* Enhanced Text Size Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                        <Type size={20} strokeWidth={2} className="text-white" />
                      </div>
                      <div>
                        <Label className="text-lg font-bold text-gray-900">Text Size</Label>
                        <div className="text-sm text-gray-600">
                          Adjust text size for optimal readability
                        </div>
                      </div>
                    </div>
                  </div>
                  <Select value={fontSize} onValueChange={(value: FontSize) => setFontSize(value)}>
                    <SelectTrigger className="w-48 h-12 bg-white border border-blue-200 rounded-xl shadow-sm">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">Small</span>
                          <span className="text-xs text-gray-500">(Compact)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-medium">Medium</span>
                          <span className="text-xs text-gray-500">(Default)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="large">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-medium">Large</span>
                          <span className="text-xs text-gray-500">(Bigger)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="extra-large">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-medium">Extra Large</span>
                          <span className="text-xs text-gray-500">(Largest)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
}
