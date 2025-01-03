import Image from "next/image";
import { Users, Target, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardWrapper } from "@/components/ui/card-wrapper";

const teamMembers = [
  {
    name: "Michał",
    image: "/michal-profil-1.webp", // Add actual image path
    badges: ["Backend", "Frontend", "UI", "Marketing", "AI"],
  },
  {
    name: "Michał",
    image: "/profil-michal-2.webp", // Add actual image path
    badges: ["Backend", "DevOps", "AI", "Marketing"],
  },
  {
    name: "Adam",
    image: "/team/adam.jpg", // Add actual image path
    badges: ["UI", "UX"],
  },
];

const sections = [
  {
    id: "cele",
    title: "Cele projektu",
    icon: <Target className="w-5 h-5" />,
    imageLeft: false,
    content: `
      Sejmofil to druga iteracja projektu [sejm-stats.pl](https://sejm-stats.pl), który zacząłem pisać jako projekt do portfolio. 
      Projekt zyskał nieoczekiwaną popularność, a nawet wsparcie dużych kanałów, takich jak [Good Times Bad Times](https://www.youtube.com/@GoodTimesBadTimesPL). W tym momencie stał się czymś więcej niż tylko hobby.

      Zacząłem traktować to jako misję, która **nie ma na celu wsparcia jakiejkolwiek partii politycznej**, a **wsparcie samej demokracji** w Polsce. *Wierzę, że obywatele, którzy mają dostęp do rzetelnych informacji, wybiorą mądrze.* 
      Cały kod projektu jest [dostępny na GitHubie](https://github.com/your-repo).
    `,
    image: "/goals.svg",
  },
  {
    id: "zespol",
    title: "Zespół",
    icon: <Users className="w-5 h-5" />,
    imageLeft: true,
    content: `
      W trakcie rozwoju sejm-stats odezwały się do mnie osoby, które podobnie jak ja uwierzyły w tę misję i miały potrzebne umiejętności. Po roku ciągłych usprawnień projektu udało nam się zidentyfikować wszystkie mankamenty oryginalnego projektu i rozpoczęliśmy pracę nad Sejmofilem.

      Ze względu na znacznie lepsze zaplecze techniczne mogliśmy zadać sobie pytanie **Co chcemy pokazać obywatelom?** - zamiast **Co umiemy zrobić?**. W ten sposób powstał projekt, który opiera się na najszerszej istniejącej analizie danych z polskiego Sejmu.
      
      Dołącz do nas na [Discordzie](https://discord.gg/your-invite) lub wesprzyj projekt na [Patronite](https://patronite.pl/your-page)!
    `,
    image: "/team.svg",
    afterContent: (
      <div className="mt-12 p-6 bg-slate-50 rounded-xl">
        <h3 className="text-xl font-semibold mb-8 text-center">Nasz zespół</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center space-y-4 p-4 bg-white rounded-lg shadow-sm"
            >
              <Avatar className="w-24 h-24">
                <AvatarImage src={member.image} alt={member.name} />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {member.badges.map((badge) => (
                  <Badge key={badge} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "metodologia",
    title: "Gwarancja obiektywizmu",
    icon: <Search className="w-5 h-5" />,
    imageLeft: false,
    content: `
      Głównym założeniem projektu jest to, że **dane nie są analizowane przez ludzi, którzy mają własne poglądy, odczucia i subiektywne opinie**, ale przez algorytmy SI, które są precyzyjnie instruowane, jak mają oceniać poszczególne teksty.

      Przy każdym elemencie widoczna jest ikonka <span className="text-primary">?</span>, którą można kliknąć, aby dowiedzieć się więcej na temat źródła danych i metod analizy. Oprócz tego kod aplikacji jest otwartoźródłowy i dostępny dla każdego.

      Najczęściej zadawane pytanie brzmi: **"Jakim cudem twierdzicie, że da się obiektywnie określić stopień manipulacji w wypowiedzi?"**

      Psychologia jasno definiuje konkretne techniki manipulacji. Na tej podstawie wybraliśmy 5 najpopularniejszych technik stosowanych przez polityków:
    `,
    image: "/explore.svg",
    afterContent: (
      <div className="mt-4 p-6">
        <CardWrapper
          title="Prompt AI"
          subtitle="Analiza manipulacji"
          headerIcon={<Sparkles className="w-5 h-5" />}
          showGradient={false}
          className="bg-white shadow-sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 font-mono bg-slate-50 p-3 rounded border border-slate-200">
              Oceń wypowiedź polityka [wypowiedź polityka] w skali od 1 do 5
              bazując na poniższych technikach manipulacji:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-slate-700">
              <li className="pl-2">
                <strong>Ad hominem</strong> – Atakowanie osoby zamiast treści
                jej argumentu
              </li>
              <li className="pl-2">
                <strong>Whataboutism</strong> – Odwracanie uwagi od zarzutu
                pytaniem „A co z...? w celu uniknięcia odpowiedzialności
              </li>
              <li className="pl-2">
                <strong>Apel do emocji</strong> – Wywoływanie strachu, gniewu,
                współczucia itp. zamiast prezentacji faktów
              </li>
              <li className="pl-2">
                <strong>Selektywne prezentowanie faktów</strong> – Pokazywanie
                tylko tych danych, które pasują do danej tezy
              </li>
              <li className="pl-2">
                <strong>Technika bandwagon</strong> – „Wszyscy tak myślą/robią,
                więc ty też powinieneś
              </li>
            </ol>
          </div>
        </CardWrapper>
      </div>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 max-w-6xl mx-auto">
      <div className="flex gap-12">
        {/* Table of Contents - Fixed position */}
        <nav className="hidden lg:block w-48 h-fit sticky top-20 p-4 border-r">
          <h2 className="font-semibold mb-4">Spis treści</h2>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-1 rounded text-sm"
                >
                  {section.icon}
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 space-y-32">
          <h1 className="text-4xl font-bold mb-16">O Projekcie</h1>

          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-20 relative pb-16"
            >
              <div
                className={`flex flex-col ${
                  section.imageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                } gap-12 items-center`}
              >
                <div className="lg:w-2/3">
                  <div className="flex items-center gap-2 mb-4">
                    {section.icon}
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    {section.content.split("\n").map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-gray-600 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: paragraph
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\*(.*?)\*/g, "<em>$1</em>")
                            .replace(
                              /\[(.*?)\]\((.*?)\)/g,
                              '<a href="$2" class="text-primary hover:underline">$1</a>'
                            )
                            .replace(/•/g, "<br>•"),
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="lg:w-1/2">
                  <Image
                    src={section.image}
                    alt={section.title}
                    width={400}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              {section.afterContent}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
