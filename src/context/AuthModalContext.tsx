"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export type AuthModalTab = "login" | "register" | "forgot";

interface AuthModalContextType {
  isOpen: boolean;
  tab: AuthModalTab;
  openModal: (tab?: AuthModalTab) => void;
  closeModal: () => void;
  setTab: (tab: AuthModalTab) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

function AuthModalSearchParamsListener({
  openModal,
}: {
  openModal: (tab?: AuthModalTab) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "login") {
      openModal("login");
    } else if (authParam === "register" || authParam === "create-account") {
      openModal("register");
    } else if (authParam === "forgot") {
      openModal("forgot");
    }
  }, [searchParams, openModal]);

  return null;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<AuthModalTab>("login");

  const openModal = useCallback((newTab: AuthModalTab = "login") => {
    setTab(newTab);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  // Lock body & html scroll when modal is open to prevent background scrolling
  useEffect(() => {
    if (!isOpen) return;
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
    };
  }, [isOpen]);

  return (
    <AuthModalContext.Provider value={{ isOpen, tab, openModal, closeModal, setTab }}>
      <Suspense fallback={null}>
        <AuthModalSearchParamsListener openModal={openModal} />
      </Suspense>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
