'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function PrivacyPage() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">
          Polityka Prywatności Sejmofil
        </CardTitle>
        <CardDescription>
          Obowiązuje od: 01.01.2025 <br />
          Data ostatniej aktualizacji: 30.01.2025
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 1. Postanowienia ogólne */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            1. Postanowienia ogólne
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
            <li>
              Niniejsza Polityka Prywatności określa zasady przetwarzania i
              ochrony danych osobowych przekazywanych przez Użytkowników w
              związku z korzystaniem z serwisu <strong>Sejmofil.pl</strong>{' '}
              (zwanego dalej „Serwisem”).
            </li>
            <li>
              Serwis działa zgodnie z przepisami prawa powszechnie
              obowiązującego na terytorium Rzeczypospolitej Polskiej, w
              szczególności z:
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>
                  Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679
                  z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w
                  związku z przetwarzaniem danych osobowych i w sprawie
                  swobodnego przepływu takich danych (RODO),
                </li>
                <li>
                  Ustawą z dnia 10 maja 2018 r. o ochronie danych osobowych,
                </li>
                <li>
                  Ustawą z dnia 18 lipca 2002 r. o świadczeniu usług drogą
                  elektroniczną.
                </li>
              </ul>
            </li>
          </ol>
        </section>

        <Separator />

        {/* 2. Definicje */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Definicje</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Administrator</strong> – osoba fizyczna prowadząca
              działalność gospodarczą (dalej: „House of Clouds Michał Sulawiak”)
              z siedzibą pod adresem Zygmunta Słomińskiego 19/149, adres e-mail:
              michal.sulawiak@houseof.cloud, która jest administratorem danych
              osobowych Użytkowników.
            </li>
            <li>
              <strong>Użytkownik</strong> – każda osoba fizyczna odwiedzająca
              Serwis lub korzystająca z jednej bądź kilku usług czy
              funkcjonalności opisanych w Polityce Prywatności.
            </li>
            <li>
              <strong>Serwis</strong> – strona internetowa dostępna pod adresem{' '}
              <a
                className="underline"
                href="https://sejmofil.pl"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://sejmofil.pl
              </a>
              .
            </li>
            <li>
              <strong>Dane osobowe</strong> – wszelkie informacje o
              zidentyfikowanej lub możliwej do zidentyfikowania osobie
              fizycznej.
            </li>
          </ul>
        </section>

        <Separator />

        {/* 3. Administrator danych osobowych */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            3. Administrator danych osobowych
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
            <li>
              Administratorem danych osobowych jest Michał Sulawiak, prowadzący
              działalność gospodarczą pod firmą HOUSE OF CLOUDS z siedzibą w
              Warszawie, adres: ul. Zygmunta Słomińskiego, nr 19, lok. 145,
              00-195, NIP 8513157946, REGON 367221691, wpisanego do Centralnej
              Ewidencji i Informacji o Działalności Gospodarczej.
            </li>
            <li>
              Z Administratorem można się skontaktować pod adresem e-mail:{' '}
              <strong>kontakt@sejmofil.pl</strong> w sprawach związanych z
              przetwarzaniem danych osobowych i realizacją przysługujących
              Użytkownikom praw.
            </li>
          </ol>
        </section>

        <Separator />

        {/* 4. Zakres gromadzonych danych */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            4. Zakres gromadzonych danych
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
            <li>
              W ramach korzystania z Serwisu mogą być gromadzone następujące
              dane osobowe:
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>adres e-mail,</li>
                <li>
                  podstawowe dane publiczne kont Facebook, Google i GitHub (np.
                  imię i nazwisko, zdjęcie profilowe),
                </li>
                <li>
                  inne podstawowe informacje dostępne w ramach publicznego
                  profilu dostawcy tożsamości (w zależności od ustawień
                  prywatności Użytkownika),
                </li>
                <li>
                  aktywność Użytkownika w Serwisie (historia logowania,
                  odwiedzin, podejmowanych czynności, w tym dane statystyczne),
                </li>
                <li>
                  adres IP lub identyfikatory urządzenia, pliki cookies i
                  podobne technologie zapisywane na urządzeniu Użytkownika.
                </li>
              </ul>
            </li>
            <li>
              Dane osobowe zbierane są wyłącznie w zakresie niezbędnym do
              realizacji opisanych w niniejszej Polityce celów.
            </li>
          </ol>
        </section>

        <Separator />

        {/* 5. Cele i podstawy prawne przetwarzania danych */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            5. Cele i podstawy prawne przetwarzania danych
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Dane osobowe są przetwarzane w następujących celach:
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>
                  <strong>Logowanie do Serwisu</strong> – umożliwienie
                  Użytkownikom korzystania z funkcji logowania za pośrednictwem
                  usług zewnętrznych (Facebook, Google, GitHub). Podstawą prawną
                  przetwarzania jest zgoda Użytkownika (art. 6 ust. 1 lit. a
                  RODO).
                </li>
                <li>
                  <strong>Personalizacja treści</strong> – dostosowywanie
                  prezentowanych treści do potrzeb i preferencji Użytkownika.
                  Podstawą prawną przetwarzania jest zgoda Użytkownika (art. 6
                  ust. 1 lit. a RODO) lub prawnie uzasadniony interes
                  Administratora (art. 6 ust. 1 lit. f RODO) w zakresie, w jakim
                  nie narusza on praw i wolności Użytkownika.
                </li>
                <li>
                  <strong>Statystyka i analiza</strong> – analizowanie
                  aktywności Użytkowników i sposobu korzystania z Serwisu, celem
                  poprawy jakości oferowanych usług. Podstawą prawną jest
                  prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit.
                  f RODO) lub zgoda, jeśli wymagają tego przepisy dotyczące np.
                  plików cookies.
                </li>
                <li>
                  <strong>Kontakt z Użytkownikiem</strong> – udzielanie
                  odpowiedzi na zapytania kierowane poprzez adres e-mail lub
                  inne kanały. Podstawą prawną jest zgoda Użytkownika (art. 6
                  ust. 1 lit. a RODO) lub niezbędność do wykonania
                  umowy/świadczenia usług (art. 6 ust. 1 lit. b RODO).
                </li>
              </ul>
            </li>
            <li>
              Administrator nie przekazuje danych osobowych innym podmiotom w
              celach marketingowych ani nie dokonuje profilowania w rozumieniu
              RODO w sposób wywołujący skutki prawne lub w podobny sposób
              istotnie wpływający na Użytkowników.
            </li>
          </ol>
        </section>

        <Separator />

        {/* 6. Okres przechowywania danych */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            6. Okres przechowywania danych
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Dane osobowe przechowywane są przez okres niezbędny do realizacji
              celów, dla których zostały zebrane, w tym:
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>
                  do momentu usunięcia konta w Serwisie przez Użytkownika,
                </li>
                <li>
                  do czasu wycofania zgody na przetwarzanie danych (jeśli
                  przetwarzanie odbywa się na podstawie zgody),
                </li>
                <li>
                  przez okres wymagany przepisami prawa (np. w celach
                  rachunkowych lub rozliczeniowych, jeżeli takie obowiązki się
                  pojawią).
                </li>
              </ul>
            </li>
            <li>
              Po upływie wskazanych okresów dane będą usuwane lub anonimizowane.
            </li>
          </ol>
        </section>

        <Separator />

        {/* 7. Logowanie przez Facebook, Google i GitHub */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            7. Logowanie przez Facebook, Google i GitHub
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
            <li>
              Serwis umożliwia logowanie przy użyciu zewnętrznych usług
              uwierzytelniających, takich jak Facebook, Google czy GitHub.
            </li>
            <li>
              W momencie logowania Administrator otrzymuje od dostawcy usług
              uwierzytelniania podstawowe informacje o Użytkowniku, m.in.:
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>adres e-mail,</li>
                <li>imię i nazwisko (lub nazwę profilu),</li>
                <li>zdjęcie profilowe (jeśli jest udostępniane),</li>
                <li>
                  inne dane niezbędne do weryfikacji konta (jeżeli są dostępne
                  zgodnie z ustawieniami prywatności Użytkownika).
                </li>
              </ul>
            </li>
            <li>
              Dane te wykorzystywane są wyłącznie w celu uwierzytelnienia
              Użytkownika w Serwisie, zapewnienia mu dostępu do funkcjonalności,
              a także – w zależności od wyrażonej zgody – do personalizacji
              treści.
            </li>
            <li>
              Serwis nie przechowuje haseł do kont Użytkowników na Facebooku,
              Google ani GitHubie. Wykorzystywane są wyłącznie bezpieczne tokeny
              dostarczone przez te serwisy w procesie logowania.
            </li>
          </ol>
        </section>

        <Separator />

        {/* 8. Prawa Użytkowników */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Prawa Użytkowników</h2>
          <p className="text-muted-foreground mb-4">
            W związku z przetwarzaniem danych osobowych Użytkownikom przysługują
            następujące prawa:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>
              <strong>Prawo dostępu do danych</strong> – Użytkownik ma prawo
              uzyskać informację, czy jego dane są przetwarzane, a jeżeli tak,
              to w jakim zakresie.
            </li>
            <li>
              <strong>Prawo sprostowania</strong> – Użytkownik ma prawo żądać
              niezwłocznego sprostowania nieprawidłowych danych osobowych oraz
              uzupełnienia niekompletnych danych.
            </li>
            <li>
              <strong>
                Prawo usunięcia danych (prawo do bycia zapomnianym)
              </strong>{' '}
              – Użytkownik może żądać usunięcia swoich danych osobowych, jeżeli
              nie są już niezbędne do celów, w których zostały zebrane, lub
              jeżeli wycofał zgodę, na podstawie której były przetwarzane.
            </li>
            <li>
              <strong>Prawo ograniczenia przetwarzania</strong> – Użytkownik
              może żądać ograniczenia przetwarzania danych w określonych
              przypadkach (np. kwestionując prawidłowość danych).
            </li>
            <li>
              <strong>Prawo do przenoszenia danych</strong> – Użytkownik ma
              prawo otrzymać swoje dane osobowe w ustrukturyzowanym formacie
              oraz przenieść je do innego administratora, o ile przetwarzanie
              odbywa się na podstawie zgody lub w związku z umową.
            </li>
            <li>
              <strong>Prawo sprzeciwu</strong> – w sytuacjach, gdy podstawą
              przetwarzania jest prawnie uzasadniony interes Administratora,
              Użytkownik może wnieść sprzeciw z przyczyn związanych z jego
              szczególną sytuacją.
            </li>
            <li>
              <strong>Prawo do wycofania zgody</strong> – w przypadku, gdy
              przetwarzanie odbywa się na podstawie zgody, Użytkownik ma prawo w
              dowolnym momencie cofnąć tę zgodę, co jednak nie wpływa na
              zgodność z prawem przetwarzania dokonanego przed jej wycofaniem.
            </li>
            <li>
              <strong>Prawo wniesienia skargi do organu nadzorczego</strong> –
              jeżeli Użytkownik uzna, że przetwarzanie jego danych osobowych
              narusza przepisy RODO, ma prawo złożyć skargę do Prezesa Urzędu
              Ochrony Danych Osobowych.
            </li>
          </ul>
          <p className="text-muted-foreground">
            W celu skorzystania z powyższych praw należy skontaktować się z
            Administratorem (dane kontaktowe w pkt 10).
          </p>
        </section>

        <Separator />

        {/* 9. Udostępnianie i przekazywanie danych */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            9. Udostępnianie i przekazywanie danych
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
            <li>
              Dane osobowe Użytkowników nie są sprzedawane ani w żaden inny
              sposób udostępniane podmiotom trzecim, o ile obowiązek
              udostępnienia nie wynika z przepisów prawa lub nie jest niezbędny
              do świadczenia usług Serwisu (np. firma hostingowa, dostawca
              infrastruktury IT).
            </li>
            <li>
              Dane nie są przekazywane do państw trzecich (poza Europejski
              Obszar Gospodarczy) ani organizacjom międzynarodowym.
            </li>
          </ol>
        </section>

        <Separator />

        {/* 10. Środki bezpieczeństwa */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            10. Środki bezpieczeństwa
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
            <li>
              Administrator dokłada wszelkich starań, aby zapewnić wysoki poziom
              bezpieczeństwa przetwarzanych danych osobowych:
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>
                  Serwis korzysta z protokołu SSL/TLS zapewniającego szyfrowanie
                  transmisji danych,
                </li>
                <li>
                  stosowane są odpowiednie zabezpieczenia infrastruktury serwera
                  i baz danych,
                </li>
                <li>
                  dostęp do danych posiadają wyłącznie osoby upoważnione,
                  zobowiązane do zachowania poufności.
                </li>
              </ul>
            </li>
            <li>
              Dodatkowo kwestie techniczne i bezpieczeństwo danych reguluje{' '}
              <strong>regulamin firmy Nicetronic</strong>, dostępny pod adresem:{' '}
              <a
                className="underline"
                href="https://nicetronic.pl/regulamin"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://nicetronic.pl/regulamin
              </a>
              .
            </li>
          </ol>
        </section>

        <Separator />

        {/* 11. Pliki cookies i technologie śledzące */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            11. Pliki cookies i technologie śledzące
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
            <li>
              Serwis korzysta z plików cookies i podobnych technologii w celu
              zapewnienia prawidłowego funkcjonowania strony, a także do celów
              statystycznych i analitycznych.
            </li>
            <li>
              Pliki cookies mogą zawierać informacje niezbędne do prawidłowego
              działania Serwisu, a także umożliwiające tworzenie statystyk
              odwiedzin (np. liczba wejść na stronę, rodzaj urządzenia).
            </li>
            <li>
              Użytkownik może w każdej chwili zmienić ustawienia przeglądarki
              dotyczące plików cookies (zablokować lub usunąć niektóre lub
              wszystkie cookies). Może to jednak wpłynąć na niektóre
              funkcjonalności Serwisu.
            </li>
            <li>
              Podstawą prawną przetwarzania danych osobowych za pośrednictwem
              plików cookies jest zgoda Użytkownika wyrażona podczas pierwszej
              wizyty w Serwisie (w zależności od charakteru cookies) lub prawnie
              uzasadniony interes Administratora (jeżeli niezbędne cookies służą
              do prawidłowego działania strony).
            </li>
          </ol>
        </section>

        <Separator />

        {/* 12. Zmiany w Polityce Prywatności */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            12. Zmiany w Polityce Prywatności
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
            <li>
              Administrator zastrzega sobie prawo do wprowadzania zmian w
              niniejszej Polityce Prywatności.
            </li>
            <li>
              O wszelkich istotnych zmianach Użytkownicy zostaną poinformowani
              poprzez stosowny komunikat w Serwisie lub w inny zwyczajowo
              przyjęty sposób (np. e-mail, jeżeli Użytkownik wyraził zgodę na
              kontakt w tym celu).
            </li>
          </ol>
        </section>

        <Separator />

        {/* 13. Kontakt z Administratorem */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            13. Kontakt z Administratorem
          </h2>
          <p className="text-muted-foreground">
            Wszelkie pytania, wnioski lub uwagi dotyczące niniejszej Polityki
            Prywatności lub przetwarzania danych osobowych prosimy kierować na
            adres e-mail: <strong>kontakt@sejmofil.pl</strong>.
          </p>
        </section>
      </CardContent>
    </Card>
  )
}
