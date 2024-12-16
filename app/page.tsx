import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {  Search, User } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b">
        <div className=" mx-auto px-2">
          <div className="flex items-center justify-between h-14">
            <div className="flex-1 flex justify-start max-w-sm mx-auto ms-2">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="wyszukaj cokolwiek"
                  className="w-full pl-8 h-9 rounded-md border bg-background px-3"
                />
              </div>
            </div>
            <div className="flex items-center gap-12 h-12 text-sm mx-8">
              {["polityk", "komisje", "interpelacje"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  {item}
                </a>
              ))}
            </div>
            <User className="h-5 w-5" />
          </div>
        </div>
      </header>

      {/* News Ticker */}
      <div className="bg-red-800 text-white px-2 py-1 text-sm whitespace-nowrap overflow-hidden">
        <div className="animate-marquee inline-block">
          <span className="mr-8">
            Różnica pomiędzy liczbą urodzeń żywych a liczbą zgonów. Wartość
            dodatnia oznacza liczbę urodzeń przewyższającą liczbę zgonów (gamma
            - odrodenie. Jest miarą do czynnika z wartością gamma, mówimy o
            użytku naturalnym)
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className=" w-full mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
          {/* Left Column */}
          <div className="md:col-span-3">
            <Card className="shadow-none border-0 bg-white/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-rose-600">Monitor</p>
                    <CardTitle className="text-lg">
                      Posiedzenia Komisji
                    </CardTitle>
                  </div>
                  <span className="text-sm text-muted-foreground">12 Nov</span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="border-l-2 border-green-500 pl-4">
                  <p className="font-medium">
                    Przesłuchanie byłego ministra sprawiedliwości
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Afera Podsłuchowa
                  </p>
                </div>
                <div className="border-l-2 border-orange-500 pl-4">
                  <p className="font-medium">
                    Przesłuchanie świadków związanych z PIS
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Wyborów ekspercyjnych
                  </p>
                </div>
                <div className="border-l-2 border-orange-500 pl-4">
                  <p className="font-medium">
                    Wypłacanie odszkodowań ofiarą powodzi
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Usuwania Skutków Powodzi
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column */}
          <div className="md:col-span-6">
            <Card className="shadow-none border-0 bg-white/50">
              <CardContent className="p-0">
                {/* <Image
                  src="/placeholder.svg"
                  alt="Classical painting"
                  width={800}
                  height={600}
                  className="w-full rounded-t-lg"
                /> */}
                <div className="p-6">
                  <p className="text-sm text-rose-600 mb-2">
                    Z ostatniego posiedzenia
                  </p>
                  <h2 className="text-2xl font-semibold mb-4">
                    Nowe Wiadomości na temat Afery podsłuchowej PiS ma olbrzymie
                    kłopoty
                  </h2>
                  <p className="text-muted-foreground">
                    DPI jest to wartość liczbowa, mówiąca o zagęszczeniu
                    pikseli. Informuje, ile punktów w wydrukowanym obrazie
                    przypada na jeden cal (2,54 cm). Przykładowo, 300 DPI
                    oznacza, że na długość jednego cala, przypada 300 punktów.
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      Zobacz więcej
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      20/12/2024
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    Bon turystyczny sukces czy porażka?
                  </h2>
                  <p className="text-muted-foreground">
                    DPI jest to wartość liczbowa, mówiąca o zagęszczeniu
                    pikseli. Informuje, ile punktów w wydrukowanym obrazie
                    przypada na jeden cal (2,54 cm). Przykładowo, 300 DPI
                    oznacza, że na długość jednego cala, przypada 300 punktów.
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      Zobacz więcej
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      20/12/2024
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="md:col-span-3">
            <Card className="shadow-none border-0 bg-white/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-rose-600">cytaty</p>
                    <CardTitle className="text-lg">Cytaty z sejmu</CardTitle>
                  </div>
                  <span className="text-sm text-muted-foreground">20 Nov</span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[
                  "Donald Tusk Kradnie Mentzenowi pieniądze...",
                  "Krzyk na sali sejmowej bo pan Jaruzelski wstał i się obraził",
                  "Donald Tusk Kradnie duże Mentzenowi pieniądze od ...",
                  "Polska Upada przez brak Lecha Kaczyńskiego...",
                ].map((title, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="font-bold text-lg">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="text-sm text-muted-foreground">
                        04 Dec 2024, Głosuj
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="link" className="text-sm justify-end">
                  Zobacz więcej
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-none border-0 bg-white/50 mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-rose-600">Elections</p>
                    <CardTitle className="text-lg">Następne Wybory:</CardTitle>
                    <p className="text-xl italic">Prezydenckie</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">zostało,</p>
                  <p className="text-6xl font-semibold">180 dni</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
