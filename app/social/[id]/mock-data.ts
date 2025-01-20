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
