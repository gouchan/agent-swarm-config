"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";

interface PageWrapperProps {
  children: React.ReactNode;
  rightColumn?: React.ReactNode;
  className?: string;
}

export function PageWrapper({
  children,
  rightColumn,
  className,
}: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Layout */}
      <div className="md:ml-64">
        <div className="mx-auto flex max-w-5xl gap-8 px-4 pt-16 md:pt-8">
          {/* Main Content */}
          <main
            className={cn("mx-auto w-full max-w-2xl flex-1 pb-20", className)}
          >
            {children}
          </main>

          {/* Optional Right Column */}
          {rightColumn && (
            <aside className="hidden w-80 shrink-0 lg:block">
              <div className="sticky top-8">{rightColumn}</div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
