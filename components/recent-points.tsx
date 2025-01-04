import { CardWrapper } from "@/components/ui/card-wrapper";
import { getTopDiscussedTopics } from "@/lib/supabase/queries";
import { Check } from "lucide-react";
import Link from "next/link";

export default async function RecentPoints() {
  const topics = await getTopDiscussedTopics();

  return (
    <CardWrapper title="Ostatnio omawiane" subtitle="Punkty obrad">
      <div className="space-y-5 py-4">
        {topics.map((topic, index) => {
          const [category, title] = topic.topic.split(" | ");

          return (
            <div key={index + topic.id} className="space-y-1">
              <Link href={`/points/${topic.id}`}>
                <div className="flex gap-3 items-start">
                  <div className="min-w-9 min-h-9 w-9 h-9 rounded-lg flex items-center justify-center bg-primary text-white">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">
                      {category} • {topic.count} wypowiedzi
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </CardWrapper>
  );
}
