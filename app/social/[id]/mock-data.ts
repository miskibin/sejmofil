export const mockVotings = [
  {
    sitting: 1,
    votingNumber: 1,
    topic: "Głosowanie nad przyjęciem w całości projektu ustawy o zmianie zasad przyznawania azylu",
    result: "Accepted",
    yes: 278,
    no: 164,
    abstained: 12,
    total: 454,
  },
  {
    sitting: 1,
    votingNumber: 2,
    topic: "Poprawka dotycząca procedur azylowych",
    result: "Rejected",
    yes: 190,
    no: 220,
    abstained: 15,
    total: 425,
  },
  {
    sitting: 1,
    votingNumber: 3,
    topic: "Wniosek mniejszości dot. bezpieczeństwa granic",
    result: "Accepted",
    yes: 245,
    no: 165,
    abstained: 12,
    total: 422,
  },
  {
    sitting: 1,
    votingNumber: 4,
    topic: "Głosowanie nad całością projektu ustawy o cudzoziemcach",
    result: "Accepted",
    yes: 230,
    no: 180,
    abstained: 20,
    total: 430,
  },
  {
    sitting: 1,
    votingNumber: 5,
    topic: "Poprawka dotycząca utworzenia specjalnej komisji ds. weryfikacji wniosków azylowych",
    result: "Rejected",
    yes: 190,
    no: 220,
    abstained: 15,
    total: 425,
  },
];

export const mockStatements = [
  {
    id: 1,
    speaker_name: "Maria Kowalska",
    number_source: 1,
    number_sequence: 1,
    statement_ai: {
      summary_tldr: "Przedstawiono szczegółową analizę wpływu proponowanych zmian na system azylowy, wskazując na potencjalne zagrożenia i korzyści...",
      citations: [
        "Z analiz przeprowadzonych przez Fundację Migrantów wynika, że obecny system pozwala na rozpatrzenie jedynie 30% wniosków w terminie...",
        "Proponowane zmiany mogą zwiększyć efektywność procesu o 60%, jednocześnie zachowując wysokie standardy bezpieczeństwa..."
      ],
      speaker_rating: { emotions: 4, manipulation: 2, logic: 5, facts: 5 },
    },
  },
  {
    id: 2,
    speaker_name: "Anna Nowak",
    number_source: 1,
    number_sequence: 1,
    statement_ai: {
      summary_tldr: "Proponowane zmiany w prawie migracyjnym są niewystarczające i mogą prowadzić do poważnych konsekwencji dla bezpieczeństwa kraju.",
      citations: ["Według najnowszych danych, które przedstawił minister, liczba wniosków o azyl wzrosła o 300% w ostatnim kwartale..."],
      speaker_rating: { emotions: 4, manipulation: 3, logic: 4, facts: 5 },
    },
  },
  {
    id: 3,
    speaker_name: "Piotr Kowalski",
    number_source: 2,
    number_sequence: 2,
    statement_ai: {
      summary_tldr: "Ustawa wprowadza kluczowe zabezpieczenia i usprawnia proces weryfikacji osób przekraczających granicę.",
      citations: ["Nowe procedury pozwolą na skrócenie czasu oczekiwania na decyzję o 60%..."],
      speaker_rating: { emotions: 5, manipulation: 2, logic: 5, facts: 4 },
    },
  },
];

export const mockSpeakerClubs = [
  { name: "Anna Nowak", club: "KO", id: 1 },
  { name: "Piotr Kowalski", club: "PiS", id: 2 },
];


export const article =
`  
**Polska prezydencja w Radzie UE pod znakiem bezpieczeństwa. Opozycja krytykuje brak konkretów**  

*8 stycznia 2025, Sejm RP*

Sejm przyjął do wiadomości program polskiej prezydencji w Radzie Unii Europejskiej na pierwszą połowę 2025 r., jednak debata ujawniła głębokie podziały polityczne. Minister Adam Szłapka (KO) przedstawił priorytety, podczas gdy opozycja zarzuca rządowi uległość wobec Brukseli i porzucenie polskich interesów.

**Główne założenia: Bezpieczeństwo ponad wszystko**  
Dokument nr 904, autorstwa ministra Szłapki, stawia na *wzmocnienie bezpieczeństwa w sześciu wymiarach*: militarnym, energetycznym, cybernetycznym, żywnościowym, zdrowotnym i ekonomicznym. Kluczowe elementy to wsparcie dla Ukrainy, współpraca transatlantycka z USA oraz uniezależnienie UE od rosyjskich surowców. Rząd zapowiada też walkę z dezinformacją i reformę jednolitego rynku.

**Ostre starcie na sali plenarnej**  
Minister Szłapka ostro zaatakował poprzedni rząd PiS: *Po tym, co zostawiliście, powinniście spłonąć ze wstydu. W 2024 r. zorganizowano tylko 3 posiedzenia Komitetu do Spraw Europejskich!*. Odnosząc się do Zielonego Ładu, przypomniał, że *to projekt zaakceptowany przez rząd Morawieckiego*.

Opozycja nie pozostawała dłużna:  
- **Marek Jakubiak (Konfederacja)**: *To dokument dobrych chęci, a dobrymi chęciami piekło jest wybrukowane. Walka z dezinformacją? To zapowiedź cenzury!*  
- **Maciej Małecki (PiS)**: *Oddaliście szansę promocji Polski, rezygnując ze szczytów w Polsce. Bruksela będzie je organizować, a my zapłacimy?*  
- **Paweł Rychlik (Republikanie)**: *Gdzie premier Tusk? Nie ograją go w UE, bo w ogóle nie wyszedł na boisko!*

**Nierozwiązane dylematy**  
Wątpliwości budzi brak odpowiedzi na kluczowe pytania:  
- Jak rząd wyłączy wydatki na obronność z unijnych reguł wydatkowych?  
- Czy zablokuje szkodliwą dla rolników umowę UE-Mercosur?  
- Jak ochroni rynek UE przed niedoborami leków?  

**Geopolityczne ambicje vs. wewnętrzne spory**  
Koalicja rządowa (KO, TD, Lewica) podkreśla historyczną szansę dla Polski. *To moment, by kształtować przyszłość Europy* – argumentują. Opozycja widzi jednak prezydencję iluzji: PiS kwestionuje kompetencje rządu, Konfederacja w ogóle kwestionuje sens członkostwa w UE, a Republikanie straszą utratą suwerenności.

**Co dalej?**  
Program trafi pod głosowanie w UE, ale już teraz wiadomo, że sukces prezydencji zależeć będzie od zdolności rządu do przełożenia ambitnych deklaracji na konkretne decyzje w Brukseli. W tle wisi pytanie o cenę polityczną – czy koalicja uda się zjednoczyć wokół europejskich celów, gdy w kraju trwa wojna na argumenty.

*Pełną treść dokumentu oraz zapis debaty można znaleźć w druku sejmowym nr 904 oraz na kanale Sejmu RP w serwisie YouTube.*
`