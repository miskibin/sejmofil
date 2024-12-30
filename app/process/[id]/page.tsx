import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import {
  AuthorsSection,
  ProcessStagesSection,
  TopicsSection,
  RelatedPrintsSection,
  TopicPrintsSection,
  SubjectsSection,
  CommentsCarouselSection,
} from "@/components/sections";
import {
  getPrint,
  getPrintComments,
  getRelatedPrints,
  getTopicsForPrint,
  getPrintsRelatedToTopic,
  getSimmilarPrints,
} from "@/lib/queries/print";
import { Person } from "@/lib/types/person";
import Markdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrintAuthors, getPrintSubjects } from "@/lib/queries/person";
import { getAllProcessStages } from "@/lib/queries/process";

export const dynamic = "force-dynamic";
// Loading components for Suspense fallbacks
const LoadingCard = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
  </div>
);

const LoadingSection = () => (
  <div className="animate-pulse">
    <div className="h-32 bg-gray-200 rounded-lg"></div>
  </div>
);

// Async components
async function PrintDetails({ id }: { id: string }) {
  const print = await getPrint(id);
  if (!print) return null;

  return (
    <Card className="mb-4 sm:mb-8">
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href={`/process/${print.number}`}>
            <Badge
              variant="outline"
              className="text-base px-3 py-1 w-fit hover:bg-accent cursor-pointer transition-colors"
            >
              Nr {print.number}
            </Badge>
          </Link>
          {print.processPrint[0] !== print.number && (
            <Link
              href={`/process/${print.processPrint[0]}`}
              className="text-sm text-primary"
            >
              Ten druk należy do procesu {print.processPrint[0]}
            </Link>
          )}
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(print.documentDate).toLocaleDateString("pl-PL")}
          </div>
        </div>
        <h1 className="text-2xl font-semibold mt-4">{print.title}</h1>
        <Markdown className="prose dark:prose-invert max-w-none mt-4">
          {print.summary}
        </Markdown>
      </CardContent>
    </Card>
  );
}

async function AuthorsContent({ id }: { id: string }) {
  const authorsData = await getPrintAuthors(id);
  const authorsByClub = authorsData.reduce<Record<string, Person[]>>(
    (acc, author) => {
      const club = author.club || "Brak klubu";
      if (!acc[club]) acc[club] = [];
      acc[club].push(author);
      return acc;
    },
    {}
  );

  if (Object.keys(authorsByClub).length === 0) return null;

  return <AuthorsSection authorsByClub={authorsByClub} />;
}

async function StagesContent({ id }: { id: string }) {
  const stages = await getAllProcessStages(id);
  if (stages.length === 0) return null;
  return <ProcessStagesSection stages={stages} />;
}

async function CommentsContent({ id }: { id: string }) {
  const comments = await getPrintComments(id);
  if (comments.length === 0) return null;
  return <CommentsCarouselSection comments={comments} />;
}

async function TopicsWithRelatedContent({ id }: { id: string }) {
  const [topics, relatedPrints, simmilarPrints] = await Promise.all([
    getTopicsForPrint(id),
    getRelatedPrints(id),
    getSimmilarPrints(id),
  ]);

  return (
    <>
      {topics.length > 0 && <TopicsSection topics={topics} />}
      {relatedPrints.length > 0 && (
        <RelatedPrintsSection prints={relatedPrints} />
      )}
      {simmilarPrints.length > 0 && (
        <RelatedPrintsSection prints={simmilarPrints} />
      )}
    </>
  );
}

async function BottomContent({ id }: { id: string }) {
  const [topics, subjects] = await Promise.all([
    getTopicsForPrint(id),
    getPrintSubjects(id),
  ]);

  const topicPrints =
    topics.length > 0
      ? (await getPrintsRelatedToTopic(topics[0].name)).filter(
          (p) => p.processPrint?.[0] !== id
        )
      : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
      <div className="lg:col-span-8">
        <TopicPrintsSection prints={topicPrints} />
      </div>
      <div className="lg:col-span-4">
        <SubjectsSection subjects={subjects} />
      </div>
    </div>
  );
}

// Main component
export default async function ProcessDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const print = await getPrint(id);
  if (!print) notFound();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<LoadingCard />}>
        <PrintDetails id={id} />
      </Suspense>

      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <Suspense fallback={<LoadingSection />}>
              <AuthorsContent id={id} />
            </Suspense>
            <Suspense fallback={<LoadingSection />}>
              <StagesContent id={id} />
            </Suspense>
            <Suspense fallback={<LoadingSection />}>
              <CommentsContent id={id} />
            </Suspense>
          </div>

          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <Suspense fallback={<LoadingSection />}>
              <TopicsWithRelatedContent id={id} />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<LoadingSection />}>
          <BottomContent id={id} />
        </Suspense>
      </div>
    </div>
  );
}
