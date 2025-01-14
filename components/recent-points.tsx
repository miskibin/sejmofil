import { CardWrapper } from "@/components/ui/card-wrapper";
import { getTopDiscussedTopics } from "@/lib/supabase/queries";
import Link from "next/link";

export default async function RecentPoints() {
  const topics = await getTopDiscussedTopics(7);

  return (
    <CardWrapper
      title="Ostatnio omawiane"
      subtitle="Punkty obrad"
      showGradient={true}
      showMoreLink="/proceedings"
    >
      <div className="space-y-5 py-4">
        {topics.map((topic, index) => {
          const [category, title] = topic.topic.split(" | ");

          return (
            <div key={index + topic.id} className="space-y-1">
              <Link
                href={`/proceedings/${topic.proceeding_id}/${topic.date}/${topic.id}`}
              >
                <div className="flex gap-x-3 items-start">
                  <span className="font-semibold text-white flex items-center justify-center bg-primary min-w-10 min-h-10 w-10 h-10 text-center rounded-lg">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
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
