// Tabela canonica dos 66 livros (canon protestante), em ordem canonica.
// O id e a posicao canonica (1 = Genesis) e coincide com a ordem dos livros
// no dataset damarals/biblias, o que torna a ingestao robusta: book_id = indice + 1.

export interface CanonicalBook {
  id: number;
  osis: string;
  usfm: string;
  abbrevPt: string;
  namePt: string;
  nameEn: string;
  testament: "OT" | "NT";
  chapterCount: number;
}

export const BOOKS: CanonicalBook[] = [
  { id: 1, osis: "Gen", usfm: "GEN", abbrevPt: "Gn", namePt: "Gênesis", nameEn: "Genesis", testament: "OT", chapterCount: 50 },
  { id: 2, osis: "Exod", usfm: "EXO", abbrevPt: "Êx", namePt: "Êxodo", nameEn: "Exodus", testament: "OT", chapterCount: 40 },
  { id: 3, osis: "Lev", usfm: "LEV", abbrevPt: "Lv", namePt: "Levítico", nameEn: "Leviticus", testament: "OT", chapterCount: 27 },
  { id: 4, osis: "Num", usfm: "NUM", abbrevPt: "Nm", namePt: "Números", nameEn: "Numbers", testament: "OT", chapterCount: 36 },
  { id: 5, osis: "Deut", usfm: "DEU", abbrevPt: "Dt", namePt: "Deuteronômio", nameEn: "Deuteronomy", testament: "OT", chapterCount: 34 },
  { id: 6, osis: "Josh", usfm: "JOS", abbrevPt: "Js", namePt: "Josué", nameEn: "Joshua", testament: "OT", chapterCount: 24 },
  { id: 7, osis: "Judg", usfm: "JDG", abbrevPt: "Jz", namePt: "Juízes", nameEn: "Judges", testament: "OT", chapterCount: 21 },
  { id: 8, osis: "Ruth", usfm: "RUT", abbrevPt: "Rt", namePt: "Rute", nameEn: "Ruth", testament: "OT", chapterCount: 4 },
  { id: 9, osis: "1Sam", usfm: "1SA", abbrevPt: "1Sm", namePt: "1 Samuel", nameEn: "1 Samuel", testament: "OT", chapterCount: 31 },
  { id: 10, osis: "2Sam", usfm: "2SA", abbrevPt: "2Sm", namePt: "2 Samuel", nameEn: "2 Samuel", testament: "OT", chapterCount: 24 },
  { id: 11, osis: "1Kgs", usfm: "1KI", abbrevPt: "1Rs", namePt: "1 Reis", nameEn: "1 Kings", testament: "OT", chapterCount: 22 },
  { id: 12, osis: "2Kgs", usfm: "2KI", abbrevPt: "2Rs", namePt: "2 Reis", nameEn: "2 Kings", testament: "OT", chapterCount: 25 },
  { id: 13, osis: "1Chr", usfm: "1CH", abbrevPt: "1Cr", namePt: "1 Crônicas", nameEn: "1 Chronicles", testament: "OT", chapterCount: 29 },
  { id: 14, osis: "2Chr", usfm: "2CH", abbrevPt: "2Cr", namePt: "2 Crônicas", nameEn: "2 Chronicles", testament: "OT", chapterCount: 36 },
  { id: 15, osis: "Ezra", usfm: "EZR", abbrevPt: "Ed", namePt: "Esdras", nameEn: "Ezra", testament: "OT", chapterCount: 10 },
  { id: 16, osis: "Neh", usfm: "NEH", abbrevPt: "Ne", namePt: "Neemias", nameEn: "Nehemiah", testament: "OT", chapterCount: 13 },
  { id: 17, osis: "Esth", usfm: "EST", abbrevPt: "Et", namePt: "Ester", nameEn: "Esther", testament: "OT", chapterCount: 10 },
  { id: 18, osis: "Job", usfm: "JOB", abbrevPt: "Jó", namePt: "Jó", nameEn: "Job", testament: "OT", chapterCount: 42 },
  { id: 19, osis: "Ps", usfm: "PSA", abbrevPt: "Sl", namePt: "Salmos", nameEn: "Psalms", testament: "OT", chapterCount: 150 },
  { id: 20, osis: "Prov", usfm: "PRO", abbrevPt: "Pv", namePt: "Provérbios", nameEn: "Proverbs", testament: "OT", chapterCount: 31 },
  { id: 21, osis: "Eccl", usfm: "ECC", abbrevPt: "Ec", namePt: "Eclesiastes", nameEn: "Ecclesiastes", testament: "OT", chapterCount: 12 },
  { id: 22, osis: "Song", usfm: "SNG", abbrevPt: "Ct", namePt: "Cânticos", nameEn: "Song of Songs", testament: "OT", chapterCount: 8 },
  { id: 23, osis: "Isa", usfm: "ISA", abbrevPt: "Is", namePt: "Isaías", nameEn: "Isaiah", testament: "OT", chapterCount: 66 },
  { id: 24, osis: "Jer", usfm: "JER", abbrevPt: "Jr", namePt: "Jeremias", nameEn: "Jeremiah", testament: "OT", chapterCount: 52 },
  { id: 25, osis: "Lam", usfm: "LAM", abbrevPt: "Lm", namePt: "Lamentações de Jeremias", nameEn: "Lamentations", testament: "OT", chapterCount: 5 },
  { id: 26, osis: "Ezek", usfm: "EZK", abbrevPt: "Ez", namePt: "Ezequiel", nameEn: "Ezekiel", testament: "OT", chapterCount: 48 },
  { id: 27, osis: "Dan", usfm: "DAN", abbrevPt: "Dn", namePt: "Daniel", nameEn: "Daniel", testament: "OT", chapterCount: 12 },
  { id: 28, osis: "Hos", usfm: "HOS", abbrevPt: "Os", namePt: "Oséias", nameEn: "Hosea", testament: "OT", chapterCount: 14 },
  { id: 29, osis: "Joel", usfm: "JOL", abbrevPt: "Jl", namePt: "Joel", nameEn: "Joel", testament: "OT", chapterCount: 3 },
  { id: 30, osis: "Amos", usfm: "AMO", abbrevPt: "Am", namePt: "Amós", nameEn: "Amos", testament: "OT", chapterCount: 9 },
  { id: 31, osis: "Obad", usfm: "OBA", abbrevPt: "Ob", namePt: "Obadias", nameEn: "Obadiah", testament: "OT", chapterCount: 1 },
  { id: 32, osis: "Jonah", usfm: "JON", abbrevPt: "Jn", namePt: "Jonas", nameEn: "Jonah", testament: "OT", chapterCount: 4 },
  { id: 33, osis: "Mic", usfm: "MIC", abbrevPt: "Mq", namePt: "Miquéias", nameEn: "Micah", testament: "OT", chapterCount: 7 },
  { id: 34, osis: "Nah", usfm: "NAM", abbrevPt: "Na", namePt: "Naum", nameEn: "Nahum", testament: "OT", chapterCount: 3 },
  { id: 35, osis: "Hab", usfm: "HAB", abbrevPt: "Hc", namePt: "Habacuque", nameEn: "Habakkuk", testament: "OT", chapterCount: 3 },
  { id: 36, osis: "Zeph", usfm: "ZEP", abbrevPt: "Sf", namePt: "Sofonias", nameEn: "Zephaniah", testament: "OT", chapterCount: 3 },
  { id: 37, osis: "Hag", usfm: "HAG", abbrevPt: "Ag", namePt: "Ageu", nameEn: "Haggai", testament: "OT", chapterCount: 2 },
  { id: 38, osis: "Zech", usfm: "ZEC", abbrevPt: "Zc", namePt: "Zacarias", nameEn: "Zechariah", testament: "OT", chapterCount: 14 },
  { id: 39, osis: "Mal", usfm: "MAL", abbrevPt: "Ml", namePt: "Malaquias", nameEn: "Malachi", testament: "OT", chapterCount: 4 },
  { id: 40, osis: "Matt", usfm: "MAT", abbrevPt: "Mt", namePt: "Mateus", nameEn: "Matthew", testament: "NT", chapterCount: 28 },
  { id: 41, osis: "Mark", usfm: "MRK", abbrevPt: "Mc", namePt: "Marcos", nameEn: "Mark", testament: "NT", chapterCount: 16 },
  { id: 42, osis: "Luke", usfm: "LUK", abbrevPt: "Lc", namePt: "Lucas", nameEn: "Luke", testament: "NT", chapterCount: 24 },
  { id: 43, osis: "John", usfm: "JHN", abbrevPt: "Jo", namePt: "João", nameEn: "John", testament: "NT", chapterCount: 21 },
  { id: 44, osis: "Acts", usfm: "ACT", abbrevPt: "At", namePt: "Atos", nameEn: "Acts", testament: "NT", chapterCount: 28 },
  { id: 45, osis: "Rom", usfm: "ROM", abbrevPt: "Rm", namePt: "Romanos", nameEn: "Romans", testament: "NT", chapterCount: 16 },
  { id: 46, osis: "1Cor", usfm: "1CO", abbrevPt: "1Co", namePt: "1 Coríntios", nameEn: "1 Corinthians", testament: "NT", chapterCount: 16 },
  { id: 47, osis: "2Cor", usfm: "2CO", abbrevPt: "2Co", namePt: "2 Coríntios", nameEn: "2 Corinthians", testament: "NT", chapterCount: 13 },
  { id: 48, osis: "Gal", usfm: "GAL", abbrevPt: "Gl", namePt: "Gálatas", nameEn: "Galatians", testament: "NT", chapterCount: 6 },
  { id: 49, osis: "Eph", usfm: "EPH", abbrevPt: "Ef", namePt: "Efésios", nameEn: "Ephesians", testament: "NT", chapterCount: 6 },
  { id: 50, osis: "Phil", usfm: "PHP", abbrevPt: "Fp", namePt: "Filipenses", nameEn: "Philippians", testament: "NT", chapterCount: 4 },
  { id: 51, osis: "Col", usfm: "COL", abbrevPt: "Cl", namePt: "Colossenses", nameEn: "Colossians", testament: "NT", chapterCount: 4 },
  { id: 52, osis: "1Thess", usfm: "1TH", abbrevPt: "1Ts", namePt: "1 Tessalonicenses", nameEn: "1 Thessalonians", testament: "NT", chapterCount: 5 },
  { id: 53, osis: "2Thess", usfm: "2TH", abbrevPt: "2Ts", namePt: "2 Tessalonicenses", nameEn: "2 Thessalonians", testament: "NT", chapterCount: 3 },
  { id: 54, osis: "1Tim", usfm: "1TI", abbrevPt: "1Tm", namePt: "1 Timóteo", nameEn: "1 Timothy", testament: "NT", chapterCount: 6 },
  { id: 55, osis: "2Tim", usfm: "2TI", abbrevPt: "2Tm", namePt: "2 Timóteo", nameEn: "2 Timothy", testament: "NT", chapterCount: 4 },
  { id: 56, osis: "Titus", usfm: "TIT", abbrevPt: "Tt", namePt: "Tito", nameEn: "Titus", testament: "NT", chapterCount: 3 },
  { id: 57, osis: "Phlm", usfm: "PHM", abbrevPt: "Fm", namePt: "Filemom", nameEn: "Philemon", testament: "NT", chapterCount: 1 },
  { id: 58, osis: "Heb", usfm: "HEB", abbrevPt: "Hb", namePt: "Hebreus", nameEn: "Hebrews", testament: "NT", chapterCount: 13 },
  { id: 59, osis: "Jas", usfm: "JAS", abbrevPt: "Tg", namePt: "Tiago", nameEn: "James", testament: "NT", chapterCount: 5 },
  { id: 60, osis: "1Pet", usfm: "1PE", abbrevPt: "1Pe", namePt: "1 Pedro", nameEn: "1 Peter", testament: "NT", chapterCount: 5 },
  { id: 61, osis: "2Pet", usfm: "2PE", abbrevPt: "2Pe", namePt: "2 Pedro", nameEn: "2 Peter", testament: "NT", chapterCount: 3 },
  { id: 62, osis: "1John", usfm: "1JN", abbrevPt: "1Jo", namePt: "1 João", nameEn: "1 John", testament: "NT", chapterCount: 5 },
  { id: 63, osis: "2John", usfm: "2JN", abbrevPt: "2Jo", namePt: "2 João", nameEn: "2 John", testament: "NT", chapterCount: 1 },
  { id: 64, osis: "3John", usfm: "3JN", abbrevPt: "3Jo", namePt: "3 João", nameEn: "3 John", testament: "NT", chapterCount: 1 },
  { id: 65, osis: "Jude", usfm: "JUD", abbrevPt: "Jd", namePt: "Judas", nameEn: "Jude", testament: "NT", chapterCount: 1 },
  { id: 66, osis: "Rev", usfm: "REV", abbrevPt: "Ap", namePt: "Apocalipse", nameEn: "Revelation", testament: "NT", chapterCount: 22 },
];

export const BOOK_BY_ID = new Map(BOOKS.map((b) => [b.id, b]));
