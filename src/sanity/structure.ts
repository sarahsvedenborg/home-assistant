import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Innhold")
    .items([
      S.listItem()
        .title("Kalender")
        .child(
          S.list()
            .title("Kalender")
            .items([
              S.documentTypeListItem("dayNote").title("Notater"),
              S.documentTypeListItem("recurringEvent").title("Faste aktiviteter"),
              S.documentTypeListItem("singleEvent").title("Enkelthendelser"),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem("movieRecommendation").title("Filmer"),
      S.documentTypeListItem("book").title("Bøker"),
      S.documentTypeListItem("reading").title("Lesing"),
      S.documentTypeListItem("wishListItem").title("Ønskeliste"),
      S.documentTypeListItem("chore").title("Ukelønn-oppgaver"),
      S.documentTypeListItem("shortMessage").title("Melding"),
      S.divider(),
      S.listItem()
        .title("Læring")
        .child(
          S.list()
            .title("Læring")
            .items([S.documentTypeListItem("studiedFlags").title("Studerte flagg")]),
        ),
         S.listItem()
        .title("Mat")
        .child(
          S.list()
            .title("Mat")
            .items([
              S.documentTypeListItem("dinner").title("Middag"),
              S.documentTypeListItem("shoppingListItem").title("Handlevare"),
              S.documentTypeListItem("recipe").title("Oppskrifter"),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem("boardIssue").title("ToDo-liste"),
      S.listItem()
        .title("Admin")
        .child(
          S.list()
            .title("Admin")
            .items([
              S.documentTypeListItem("birthday").title("Bursdag"),
              S.documentTypeListItem("familyMember").title("Familiemedlem"),
              S.documentTypeListItem("featureSuggestion").title("Feature suggestion"),
            ]),
        ),
    ]);
