import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  FileText,
  Users,
  MessageSquare,
  GitBranch,
} from "lucide-react";
import {
  AuthorsSection,
  TopicsSection,
  RelatedPrintsSection,
  CommentsSection,
  ProcessStagesSection,
} from "@/components/sections";
import {
  getPrint,
  getPrintAuthors,
  getPrintComments,
  getRelatedPrints,
  getTopicsForPrint,
  getAllProcessStages,
} from "@/lib/queries";
import { PrintAuthor, Topic, Print, Comment, ProcessStage } from "@/lib/types";

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
      <div className="container mx-auto p-8 space-y-8">
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-lg px-4 py-1">
                Nr {print.number}
              </Badge>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {new Date(print.documentDate).toLocaleDateString("pl-PL")}
              </div>
            </div>
            <CardTitle>
              <h1 className="text-3xl font-bold text-primary">{print.title}</h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-lg text-muted-foreground">{print.summary}</p>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {topics.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Tematy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TopicsSection topics={topics} />
                  </CardContent>
                </Card>
              )}

              {Object.keys(authorsByClub).length > 0 && (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Autorzy według klubów
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AuthorsSection authorsByClub={authorsByClub} />
                  </CardContent>
                </Card>
              )}

              {relatedPrints.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-primary" />
                      Powiązane druki ({relatedPrints.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RelatedPrintsSection prints={relatedPrints} />
                  </CardContent>
                </Card>
              )}

              {comments.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Opinie i komentarze ({comments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CommentsSection comments={comments} />
                  </CardContent>
                </Card>
              )}
            </div>

            {stages.length > 0 && (
              <Card className="shadow-md mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                    Przebieg procesu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProcessStagesSection stages={stages} />
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error:", error);
    return <div>Error loading process data</div>;
  }
}
