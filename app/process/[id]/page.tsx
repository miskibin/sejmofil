import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Users,
  GitBranch,
  FileText,
  ChevronRight,
} from "lucide-react";
import {
  AuthorsSection,
  ProcessStagesSection,
  TopicsSection,
  RelatedPrintsSection,
} from "@/components/sections";
import {
  getPrint,
  getPrintAuthors,
  getPrintComments,
  getRelatedPrints,
  getTopicsForPrint,
  getAllProcessStages,
} from "@/lib/queries";
import { PrintAuthor } from "@/lib/types";

export default async function ProcessPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const processNumber = params.id;
    const [print, stages, authorsData, comments, relatedPrints, topics] =
      await Promise.all([
        getPrint(processNumber),
        getAllProcessStages(processNumber),
        getPrintAuthors(processNumber),
        getPrintComments(processNumber),
        getRelatedPrints(processNumber),
        getTopicsForPrint(processNumber),
      ]);

    if (!print) throw new Error("Print not found");

    // Group authors by club
    const authorsByClub = authorsData.reduce((acc, author) => {
      const club = author.club || "Brak klubu";
      if (!acc[club]) acc[club] = [];
      acc[club].push(author);
      return acc;
    }, {} as Record<string, PrintAuthor[]>);

    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="text-base px-3 py-1">
            Nr {print.number}
          </Badge>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {new Date(print.documentDate).toLocaleDateString("pl-PL")}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-primary mb-4">{print.title}</h1>

        <p className="text-muted-foreground mb-6">{print.summary}</p>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Main column */}
          <div className="space-y-6">
            {Object.keys(authorsByClub).length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-primary" />
                    Autorzy
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <AuthorsSection authorsByClub={authorsByClub} />
                </CardContent>
              </Card>
            )}

            {stages.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GitBranch className="h-4 w-4 text-primary" />
                    Przebieg procesu
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <ProcessStagesSection stages={stages} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Side column */}
          <div className="space-y-6">
            {/* Topics */}
            {topics.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-primary" />
                    Tematy
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <TopicsSection topics={topics} />
                </CardContent>
              </Card>
            )}

            {/* Related Prints */}
            {relatedPrints.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    Powiązane druki
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <RelatedPrintsSection prints={relatedPrints} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Comments Carousel */}
        {comments.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              Opinie i komentarze ({comments.length})
            </h2>
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent>
                {comments.map((comment, index) => (
                  <CarouselItem
                    key={`${comment.author}-${comment.organization}-${index}`}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <Card className="p-4 h-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-primary">
                          {comment.author}
                        </span>
                        <Badge
                          variant={
                            comment.sentiment === "Pozytywny"
                              ? "default"
                              : comment.sentiment === "Negatywny"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {comment.sentiment}
                        </Badge>
                      </div>
                      {comment.organization && (
                        <span className="text-xs text-muted-foreground block mb-2">
                          ({comment.organization})
                        </span>
                      )}
                      <p className="text-sm">{comment.summary}</p>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error:", error);
    return <div>Error loading process data</div>;
  }
}
