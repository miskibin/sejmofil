export interface SearchResultItem {
  title: string;
  date?: string;
  metadata: {
    text: string;
    icon?: React.ReactNode;
  };
  content?: string;
  href: string;
}
