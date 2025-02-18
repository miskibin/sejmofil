import { ReactNode } from "react";

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
    <div className={className}>
      {/* Content and sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Main content */}
        <main className="col-span-5">
          {filterBar}
          <div className="space-y-4">{content}</div>
        </main>

        {/* Sidebar */}
        <aside className="col-span-2">
          <div className="sticky top-24">{sidebar}</div>
        </aside>
      </div>
    </div>
  );
}
