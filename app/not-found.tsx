import { CardWrapper } from "@/components/ui/card-wrapper";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 min-h-[80vh] flex items-center justify-center">
      <CardWrapper
        title="Błąd 404"
        subtitle="Strona nie została znaleziona"
        showSource={false}
        showGradient={false}
        className="max-w-lg"
        headerIcon={<AlertCircle className="h-6 w-6 text-destructive" />}
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <p className="text-muted-foreground">
            Przepraszamy, ale strona której szukasz nie istnieje lub została
            przeniesiona.
          </p>

          <Button asChild>
            <Link href="/">Wróć do strony głównej</Link>
          </Button>
        </div>
      </CardWrapper>
    </main>
  );
}
