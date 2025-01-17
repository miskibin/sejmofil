import { signInWithGitHub } from "./actions";
import { Button } from "@/components/ui/button";
import { Lock, Github } from "lucide-react";
import { CardWrapper } from "@/components/ui/card-wrapper";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center">
      <CardWrapper
        className="max-w-96"
        headerIcon={<Lock width={5} height={5} />}
        title="Zaloguj się"
      >
        <form className="space-y-4">
          <Button
            formAction={signInWithGitHub}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Github className="w-5 h-5" />
            Zaloguj się przez GitHub
          </Button>
        </form>
      </CardWrapper>
    </div>
  );
}
