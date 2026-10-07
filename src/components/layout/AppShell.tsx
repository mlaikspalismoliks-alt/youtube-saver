"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Header } from "./Header";
import { ToastProvider } from "@/components/ui/Toast";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <WorkspaceProvider>
        <div className="min-h-screen bg-background text-text-primary flex">
          {/* Desktop Left Sidebar */}
          <Sidebar />

          {/* Main Column */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile Navigation (Top bar + Sheet + Bottom dock) */}
            <MobileNav />

            {/* Desktop Top Header Bar */}
            <Header />

            {/* Main Content Area */}
            <main className="flex-1 pb-20 lg:pb-10 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </WorkspaceProvider>
    </ToastProvider>
  );
}
