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
  getPrintAuthors,
  getPrintComments,
  getRelatedPrints,
  getTopicsForPrint,
  getAllProcessStages,
  getPrintsRelatedToTopic,
  getPrintSubjects,
  getSimmilarPrints,
} from "@/lib/queries";
import { Person } from "@/lib/types";
import Markdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";

// Update the PageProps interface to match Next.js 15 types
type Params = Promise<{ id: string }>;

function LoadingPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <div className="animate-pulse h-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="animate-pulse h-32 bg-muted rounded-lg" />
            <div className="animate-pulse h-32 bg-muted rounded-lg" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="animate-pulse h-32 bg-muted rounded-lg" />
            <div className="animate-pulse h-32 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function ProcessContent({ id }: { id: string }) {
  const [
    print,
    stages,
    authorsData,
    comments,
    relatedPrints,
    topics,
    subjects,
    simmilarPrints,
  ] = await Promise.all([
    getPrint(id),
    getAllProcessStages(id),
    getPrintAuthors(id),
    getPrintComments(id),
    getRelatedPrints(id),
    getTopicsForPrint(id),
    getPrintSubjects(id),
    getSimmilarPrints(id),
  ]);

  if (!print) {
    notFound();
  }

  // Get related topic prints - only if topics exist
  const topicPrints =
    topics.length > 0
      ? (await getPrintsRelatedToTopic(topics[0].name)).filter(
          (p) => p.processPrint?.[0] !== id
        )
      : [];

  // Group authors by club using type-safe reducer
  const authorsByClub = authorsData.reduce<Record<string, Person[]>>(
    (acc, author) => {
      const club = author.club || "Brak klubu";
      if (!acc[club]) {
        acc[club] = [];
      }
      acc[club].push(author);
      return acc;
    },
    {}
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
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
                className="text-sm text-[#8B1538]"
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

      <div className="space-y-4 sm:space-y-6">
        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {Object.keys(authorsByClub).length > 0 && (
              <Link
                href="/authors"
                className="block hover:opacity-75 transition-opacity"
              >
                <AuthorsSection authorsByClub={authorsByClub} />
              </Link>
            )}

            {stages.length > 0 && <ProcessStagesSection stages={stages} />}

            {comments.length > 0 && (
              <CommentsCarouselSection comments={comments} />
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            {topics.length > 0 && (
              <Link
                href="/topics"
                className="block hover:opacity-75 transition-opacity"
              >
                <TopicsSection topics={topics} />
              </Link>
            )}

            {relatedPrints.length > 0 && (
              <RelatedPrintsSection prints={relatedPrints} />
            )}

            {simmilarPrints.length > 0 && (
              <RelatedPrintsSection prints={simmilarPrints} />
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-8">
            <TopicPrintsSection prints={topicPrints} />
          </div>
          <div className="lg:col-span-4">
            <SubjectsSection subjects={subjects} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProcessDetail(props: { params: Params }) {
  const params = await props.params;
  const id = params.id;

  if (!id) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <ProcessContent id={id} />
    </Suspense>
  );
}
