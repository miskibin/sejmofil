import Image from "next/image";
import {
  Users,
  Target,
  Search,
  Sparkles,
  HeartHandshake,
  History,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardWrapper } from "@/components/ui/card-wrapper";
import Script from "next/script";

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
      Sejmofil to projekt **non-profit**, którego celem jest wspieranie demokracji w Polsce poprzez zwiększanie transparentności pracy Sejmu. Zespół wierzy, że **dostęp do rzetelnych i obiektywnych informacji** jest fundamentem świadomego społeczeństwa obywatelskiego.

      Projekt **nie wspiera żadnej partii politycznej**, koncentrując się na dostarczaniu obiektywnych danych i analiz. *Kiedy obywatele mają dostęp do rzetelnych informacji, mogą podejmować świadome decyzje.*

      Cały kod projektu jest [dostępny na GitHubie](https://github.com/your-repo), a metodologia analizy jest w pełni transparentna.
    `,
    image: "/goals.svg",
  },
  {
    id: "poczatki",
    title: "Początki projektu",
    icon: <History className="w-5 h-5" />,
    imageLeft: true,
    content: `
      Wszystko zaczęło się od projektu [sejm-stats.pl](https://sejm-stats.pl), który szybko zyskał nieoczekiwaną popularność i wsparcie dużych kanałów, takich jak [Good Times Bad Times](https://www.youtube.com/@GoodTimesBadTimesPL).

      Po roku ciągłych usprawnień, udało nam się zidentyfikować obszary wymagające zmian i rozpoczęliśmy pracę nad Sejmofilem - projektem wykorzystującym najnowocześniejsze technologie do analizy pracy Sejmu.
    `,
    image: "/history.svg",
  },
  {
    id: "zespol",
    title: "Zespół",
    icon: <Users className="w-5 h-5" />,
    imageLeft: false,
    content: `
      Z czasem uformował nam się stały zespół.  Złożony z osób, które połączyła wspólna pasja do technologii i polityki.
      Dzięki połączeniu różnych perspektyw i umiejętności, zespół stworzył system oparty na najszerszej istniejącej analizie danych parlamentarnych w Polsce, wykorzystując sztuczną inteligencję do obiektywnej oceny pracy Sejmu.
      
      Dołącz do nas na [Discordzie](https://discord.gg/your-invite) lub wesprzyj projekt na [Patronite](https://patronite.pl/your-page)!
    `,
    image: "/team.svg",
    afterContent: (
      <div className="mt-12 p-0 sm:p-6 bg-slate-50 rounded-xl">
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
    imageLeft: true,
    content: `
      Głównym założeniem projektu jest to, że **dane nie są analizowane przez ludzi, którzy mają własne poglądy, odczucia i subiektywne opinie**, ale przez algorytmy SI, które są precyzyjnie instruowane, jak mają oceniać poszczególne teksty.

      Przy każdym elemencie widoczna jest ikonka <span className="text-primary">?</span>, którą można kliknąć, aby dowiedzieć się więcej na temat źródła danych i metod analizy. Oprócz tego kod aplikacji jest otwartoźródłowy i dostępny dla każdego.

      Najczęściej zadawane pytanie brzmi: **"Jakim cudem twierdzicie, że da się obiektywnie określić stopień manipulacji w wypowiedzi?"**

      Psychologia jasno definiuje konkretne techniki manipulacji. Na tej podstawie wybraliśmy 5 najpopularniejszych technik stosowanych przez polityków:
    `,
    image: "/explore.svg",
    afterContent: (
      <div className="mt-4 p-0 md:p-6">
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
  {
    id: "pomoc",
    title: "Jak mogę pomóc",
    icon: <HeartHandshake className="w-5 h-5" />,
    imageLeft: false,
    content: `
    Projekt Sejmofil to inicjatywa **non-profit**, która wymaga od nas znacznych nakładów finansowych i setek godzin pracy za darmo. **Każda forma pomocy jest dla nas niezwykle motywująca**.

    **Wsparcie finansowe**
    Przy pomocy AI przeanalizowaliśmy ponad 300 000 stron dokumentów sejmowych. Każdy kolejny dzień posiedzeń to koszt od 10 do 40 zł, a do tego dochodzą koszty utrzymania infrastruktury. Wesprzyj nas na [Patronite](https://patronite.pl/your-page)!

    **Dołącz do zespołu**
    Napisz do nas na [Discordzie](https://discord.gg/your-invite) jeśli masz pomysł na **nowe funkcje** strony, doświadczenie w **marketingu**, **technologiach webowych**, lub dysponujesz **wiedzą polityczną**.
`,
    image: "/help.svg",
    afterContent: (
      <div className="mt-12  bg-slate-50 space-y-6">
        {/* Coffee Button */}
        <div className="flex justify-center">
          <Script
            type="text/javascript"
            src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
            data-name="bmc-button"
            data-slug="sejmstats"
            data-color="#76052a"
            data-emoji="☕"
            data-font="Lato"
            data-text="Buy me a coffee"
            data-outline-color="#ffffff"
            data-font-color="#ffffff"
            data-coffee-color="#FFDD00"
          ></Script>
        </div>

        {/* Patronite Widget */}
        <div className="flex justify-center">
          <iframe
            src="https://patronite.pl/widget/sejm-stats/904247/small/light/colorful?description=Dzi%C4%99kuj%C4%99%20za%20Twoje%20wsparcie!"
            className="border rounded-md shadow-md w-96 max-w-fit h-96"
          ></iframe>
        </div>
      </div>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="flex gap-8">
      {/* Desktop ToC */}
      <nav className="hidden lg:block w-48 h-fit sticky top-20">
        <h2 className="font-semibold mb-4">Spis treści</h2>
        <ul className="space-y-2 border-l">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors pl-4 py-1 -ml-px border-l hover:border-primary"
              >
                {section.icon}
                <span className="text-sm">{section.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 space-y-24">
        <h1 className="text-3xl md:text-4xl font-bold">O Projekcie</h1>

        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20">
            <div
              className={`flex flex-col ${
                section.imageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-8 lg:gap-12 items-start`}
            >
              <div className="w-full lg:w-2/3">
                <div className="flex items-center gap-2 mb-4">
                  {section.icon}
                  <h2 className="text-xl md:text-2xl font-bold">
                    {section.title}
                  </h2>
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
              <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
                <Image
                  src={section.image}
                  alt={section.title}
                  width={400}
                  height={400}
                  className="w-full max-w-[300px] lg:max-w-none h-auto"
                />
              </div>
            </div>

            {/* Team and AI Prompt sections */}
            {section.afterContent && (
              <div className="mt-8 sm:mt-12">
                {section.id === "zespol" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
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
                            <Badge
                              key={badge}
                              variant="secondary"
                              className="text-xs"
                            >
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  section.afterContent
                )}
              </div>
            )}

            <div className="mt-12 border-b border-gray-100" />
          </section>
        ))}
      </main>
    </div>
  );
}
