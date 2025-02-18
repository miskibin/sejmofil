import { ReactNode } from "react";
import { Menu } from "lucide-react";

interface PageLayoutProps {
  filterBar: ReactNode;
  sidebar: ReactNode;
  content: ReactNode;
  className?: string;
}

export default function PageLayout({
  filterBar,
  sidebar,
  content,
  className = "",
}: PageLayoutProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Filter bar */}
      {filterBar}

      {/* Content and sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Main content */}
        <main className="col-span-5">
          <div className="space-y-4">{content}</div>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block col-span-2">
          {/* The sticky container ensures the sidebar remains visible until the end of its parent */}
          <div className="sticky top-4">{sidebar}</div>
        </aside>
      </div>

      {/* Mobile sidebar trigger */}
      <div className="fixed lg:hidden bottom-4 right-4 z-20">
        <button
          onClick={() => {
            /* Mobile sidebar logic */
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
