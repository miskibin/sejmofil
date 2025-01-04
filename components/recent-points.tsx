import { CardWrapper } from "@/components/ui/card-wrapper";
import { getTopDiscussedTopics } from "@/lib/supabase/queries";
import { Check } from "lucide-react";

export default async function RecentPoints() {
  const topics = await getTopDiscussedTopics();
  
  return (
    <CardWrapper title="Najczęściej omawiane" subtitle="Tematy">
      <div className="space-y-5 py-4">
        {topics.map((topic, index) => {
          const [category, title] = topic.topic.split(" | ");
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex gap-3 items-start">
                <div className="min-w-9 min-h-9 w-9 h-9 rounded-lg flex items-center justify-center bg-primary text-white">
                  <Check className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-xl font-normal leading-tight">
                    {title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {category} • {topic.count} wypowiedzi
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CardWrapper>
  );
}
