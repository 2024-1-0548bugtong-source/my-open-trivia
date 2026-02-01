"use client";

import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface UserContextType {
  nickname: string | null;
  login: (name: string) => void;
  logout: () => void;
  setNickname: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Initialize nickname from localStorage
const initializeNickname = () => {
  if (typeof window === "undefined") return null;
  const storedNickname = localStorage.getItem('my-open-trivia.nickname');
  return storedNickname && storedNickname.trim() ? storedNickname : null;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nickname, setNicknameState] = useState<string | null>(() => initializeNickname());

  const login = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Nickname cannot be empty');
    }
    if (trimmed.length < 2) {
      throw new Error('Nickname must be at least 2 characters');
    }
    if (trimmed.length > 30) {
      throw new Error('Nickname must be at most 30 characters');
    }
    console.log('[LOGIN] Setting nickname:', trimmed);
    setNicknameState(trimmed);
    localStorage.setItem('my-open-trivia.nickname', trimmed);
    console.log('[LOGIN] Nickname saved to localStorage:', localStorage.getItem('my-open-trivia.nickname'));
  };

  const logout = () => {
    console.log('[LOGOUT] Clearing nickname');
    setNicknameState(null);
    localStorage.removeItem('my-open-trivia.nickname');
    console.log('[LOGOUT] Nickname cleared from localStorage');
  };

  const setNickname = (name: string) => {
    login(name); // Use same validation as login
  };

  // Don't render children until localStorage is loaded (prevents hydration mismatch)
  return (
    <UserContext.Provider value={{ nickname, login, logout, setNickname }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using UserContext
// Returns null if used outside of UserProvider (for SSR safety)
export const useUser = (): UserContextType | null => {
  const context = useContext(UserContext);
  return context || null;
};
