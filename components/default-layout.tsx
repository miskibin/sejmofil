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
          {/* If your sidebar is short, add a test height to see sticky in action */}
          <div className="sticky bottom-0">{sidebar}</div>
        </aside>
      </div>
    </div>
  );
}
