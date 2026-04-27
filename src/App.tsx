import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type MainTab =
  | 'listeningPractice'
  | 'writingPractice'
  | 'realExamScenario'
  | 'realWritingScenario'
  | 'realListeningPaper'
  | 'realListeningPaperEnglish'
  | 'realWritingPaper'
  | 'realWritingPaperEnglish'
  | 'resources'
type ListeningQuestionType = 'mcq' | 'boolean' | 'short'

type ListeningQuestion = {
  id: string
  prompt: string
  type: ListeningQuestionType
  options?: string[]
  correctAnswer?: string
  acceptedAnswers?: string[]
}

type ListeningSection = {
  id: string
  kind: 'listening'
  title: string
  pattern: string
  instruction: string
  audioText: string
  questions: ListeningQuestion[]
}

type WritingSection = {
  id: string
  kind: 'writing'
  title: string
  pattern: string
  targetWords: string
  instruction: string
  prompt: string
  promptEnglish: string
  modelAnswerSwedish: string
  modelAnswerTranslationEnglish: string
  modelAnswerEnglish: string
  checklist: string[]
  phraseBank: string[]
  starter: string
}

type WritingPracticeTopic = {
  sv: string
  en: string
  answerSv: string
  answerEn: string
  trick: string
  keywords: string[]
}

type ListeningPracticeTopic = {
  id: string
  sv: string
  en: string
  transcriptSv: string
  transcriptEn: string
  trick: string
  keywords: string[]
  listenFor: string[]
  questions: ListeningQuestion[]
}

type RealExamScenario = {
  id: string
  title: string
  titleSv: string
  instructionSv: string
  instructionEn: string
  introSv: string
  mainSv: string
  transcriptSv: string
  transcriptEn: string
  pauseMs: number
  questions: ListeningQuestion[]
}

type RealWritingScenario = {
  id: string
  title: string
  titleSv: string
  pattern: string
  targetWords: string
  instructionSv: string
  instructionEn: string
  promptSv: string
  promptEn: string
  checklist: string[]
  phraseBank: string[]
  starter: string
  modelAnswerSv: string
  modelAnswerEn: string
}

type RealListeningPaperExam = {
  id: string
  title: string
  sections: RealExamScenario[]
}

type RealWritingPaperExam = {
  id: string
  title: string
  tasks: RealWritingScenario[]
}

type MockExam = {
  id: string
  title: string
  theme: string
  commonInHall: string[]
  durationMinutes: number
  hallNotes: string[]
  vocabulary: string[]
  listeningSections: ListeningSection[]
  writingSections: WritingSection[]
}

type ExamAnswers = Record<string, Record<string, string>>

const tabs: { id: MainTab; label: string }[] = [
  { id: 'listeningPractice', label: 'Listening practice' },
  { id: 'writingPractice', label: 'Writing practice' },
  { id: 'realExamScenario', label: 'Real exam scenario' },
  { id: 'realWritingScenario', label: 'Real writing scenario' },
  { id: 'realListeningPaper', label: 'Horförståelse provpapper' },
  { id: 'realListeningPaperEnglish', label: 'Listening paper (English)' },
  { id: 'realWritingPaper', label: 'Skrivprov papper' },
  { id: 'realWritingPaperEnglish', label: 'Writing paper (English)' },
  { id: 'resources', label: 'Resources' },
]

const resources = [
  {
    title: 'Official YKI sample tasks (Swedish)',
    description: 'Main source for task pattern and question formats at intermediate level.',
    url: 'https://ykitesti.solki.jyu.fi/en/tutustu-testiin/svenska/',
  },
  {
    title: 'OPH: Before the YKI test',
    description: 'Official test-day rules, subtests, and question-type overview.',
    url: 'https://www.oph.fi/en/koulutus-ja-tutkinnot/kieli-ja-kaantajatutkinnot/yleiset-kielitutkinnot-yki/ennen-testia',
  },
  {
    title: 'OPH: YKI overview',
    description: 'Official information about levels and language certificate use for citizenship.',
    url: 'https://www.oph.fi/en/national-certificates-language-proficiency-yki',
  },
  {
    title: 'Yle Nyheter på lätt svenska',
    description: 'Daily easy-Swedish listening for B1 rhythm and common vocabulary.',
    url: 'https://areena.yle.fi/1-50362086',
  },
  {
    title: 'Radio Sweden på lätt svenska',
    description: 'More voices and topics for practical listening stamina.',
    url: 'https://www.sverigesradio.se/radioswedenpalattsvenska',
  },
  {
    title: '8 Sidor',
    description: 'Simple daily reading to support B1 text understanding.',
    url: 'https://8sidor.se/',
  },
]

const officialYkiNotes = [
  'YKI uses practical everyday situations, not special professional language.',
  'For citizenship, level 3 (intermediate) in Swedish or Finnish is the key target.',
  'Question examples are for familiarization and are not official live test items.',
  'In listening, common formats are multiple choice, true/false, and open answers.',
]

const examBlueprints = [
  {
    id: 'exam-1',
    title: 'Mock Exam 1',
    theme: 'Housing and repairs',
    shortAudio:
      'Hej, det här är Sara från bostadsbolaget. På torsdag klockan åtta börjar vi byta lås i huset. Arbetet tar ungefär två timmar. Du behöver vara hemma eller lämna nyckeln på kontoret senast onsdag eftermiddag.',
    shortQuestions: [
      {
        id: 'e1-q1',
        prompt: 'När börjar arbetet?',
        type: 'mcq' as const,
        options: ['På onsdag eftermiddag', 'På torsdag klockan åtta', 'På fredag klockan två'],
        correctAnswer: 'På torsdag klockan åtta',
      },
      {
        id: 'e1-q2',
        prompt: 'Vad måste den boende göra?',
        type: 'mcq' as const,
        options: [
          'Köpa ett nytt lås',
          'Vara hemma eller lämna nyckeln',
          'Ringa polisen',
        ],
        correctAnswer: 'Vara hemma eller lämna nyckeln',
      },
    ],
    tfAudio:
      'Mikael pratar med sin granne om ett problem i tvättstugan. Maskinerna fungerar ofta dåligt och bokningssystemet är svårt att använda. Grannen tycker att huset borde köpa två nya maskiner, men Mikael vill först tala med styrelsen och fråga vad det kostar.',
    tfQuestions: [
      {
        id: 'e1-q3',
        prompt: 'Mikael tycker att bokningssystemet är enkelt.',
        type: 'boolean' as const,
        correctAnswer: 'False',
      },
      {
        id: 'e1-q4',
        prompt: 'Grannen vill köpa två nya maskiner.',
        type: 'boolean' as const,
        correctAnswer: 'True',
      },
    ],
    openAudio:
      'Kommunen informerar om en ny återvinningsstation i området. Stationen öppnar den tredje juni bredvid matbutiken. Där kan man lämna papper, plast, glas och små batterier. På vardagar är stationen öppen från sju på morgonen till nio på kvällen. På helger stänger den redan klockan sex. Kommunen hoppas att fler ska sortera sitt avfall rätt.',
    openQuestions: [
      {
        id: 'e1-q5',
        prompt: 'Var öppnar den nya återvinningsstationen?',
        type: 'short' as const,
        acceptedAnswers: ['bredvid matbutiken', 'vid matbutiken'],
      },
      {
        id: 'e1-q6',
        prompt: 'Varför öppnar kommunen stationen?',
        type: 'short' as const,
        acceptedAnswers: ['fler ska sortera', 'sortera sitt avfall rätt', 'mer återvinning'],
      },
    ],
    writingOne:
      'You live in an apartment and there is strong smell and moisture in the bathroom. Write an email to the housing company. Describe the problem, explain how long it has lasted, say why it is difficult, and ask for repair help.',
    writingTwo:
      'Write your opinion: should apartment buildings have stricter quiet rules in the evening? Give one clear opinion and three reasons.',
    vocabulary: ['hyra', 'reparation', 'styrelse', 'nyckel', 'tvättstuga', 'återvinning'],
  },
  {
    id: 'exam-2',
    title: 'Mock Exam 2',
    theme: 'School and family life',
    shortAudio:
      'Hej! Skolan meddelar att klass 6 åker på utflykt nästa tisdag. Bussen går klockan nio från skolgården och eleverna kommer tillbaka halv tre. Barnen ska ha med matsäck, regnjacka och en vattenflaska.',
    shortQuestions: [
      {
        id: 'e2-q1',
        prompt: 'När går bussen?',
        type: 'mcq' as const,
        options: ['Klockan nio', 'Halv tre', 'Nästa måndag'],
        correctAnswer: 'Klockan nio',
      },
      {
        id: 'e2-q2',
        prompt: 'Vad ska barnen ta med?',
        type: 'mcq' as const,
        options: ['Pass och pengar', 'Matsäck, regnjacka och vattenflaska', 'Bara skolböcker'],
        correctAnswer: 'Matsäck, regnjacka och vattenflaska',
      },
    ],
    tfAudio:
      'Fatima och hennes son pratar om läxor. Sonen vill spela spel direkt efter skolan, men Fatima vill att han först läser svenska i trettio minuter. De bestämmer att han får vila en stund, göra läxan och sedan spela en timme.',
    tfQuestions: [
      {
        id: 'e2-q3',
        prompt: 'Sonen vill göra läxan direkt när han kommer hem.',
        type: 'boolean' as const,
        correctAnswer: 'False',
      },
      {
        id: 'e2-q4',
        prompt: 'De hittar en kompromiss.',
        type: 'boolean' as const,
        correctAnswer: 'True',
      },
    ],
    openAudio:
      'Föräldraföreningen ordnar en kväll om barns skärmtid på medborgarhuset. Kvällen hålls den artonde september klockan arton. En skolpsykolog berättar hur skärmtid påverkar sömn och koncentration. Efter föreläsningen får föräldrarna ställa frågor och diskutera praktiska regler hemma. Det kostar inget att delta, men man ska anmäla sig på skolans webbplats.',
    openQuestions: [
      {
        id: 'e2-q5',
        prompt: 'Vad handlar kvällen om?',
        type: 'short' as const,
        acceptedAnswers: ['barns skärmtid', 'skärmtid'],
      },
      {
        id: 'e2-q6',
        prompt: 'Hur anmäler man sig?',
        type: 'short' as const,
        acceptedAnswers: ['på skolans webbplats', 'webbplats'],
      },
    ],
    writingOne:
      'Write to your child’s teacher. Explain that your child was absent, ask for homework information, and politely ask how your child can catch up.',
    writingTwo:
      'Write your opinion: should schools give children less homework? Give reasons and one example from daily life.',
    vocabulary: ['utflykt', 'matsäck', 'läxa', 'skärmtid', 'koncentration', 'anmäla'],
  },
  {
    id: 'exam-3',
    title: 'Mock Exam 3',
    theme: 'Health and appointments',
    shortAudio:
      'Hej, du har kommit till tandkliniken. Din tid på fredag måste flyttas eftersom tandläkaren är sjuk. Vi erbjuder i stället måndag klockan tio eller tisdag klockan fjorton. Ring tillbaka före klockan sexton i dag.',
    shortQuestions: [
      {
        id: 'e3-q1',
        prompt: 'Varför flyttas tiden?',
        type: 'mcq' as const,
        options: ['Kliniken är stängd för renovering', 'Tandläkaren är sjuk', 'Patienten har avbokat'],
        correctAnswer: 'Tandläkaren är sjuk',
      },
      {
        id: 'e3-q2',
        prompt: 'När ska man ringa tillbaka?',
        type: 'mcq' as const,
        options: ['Före klockan sexton i dag', 'Nästa vecka', 'Efter klockan sexton'],
        correctAnswer: 'Före klockan sexton i dag',
      },
    ],
    tfAudio:
      'Jonas har ont i ryggen men vill inte stanna hemma från jobbet. Hans vän råder honom att kontakta hälsocentralen och vila några dagar. Jonas säger att han först ska prova lätt träning och bättre arbetsställning, men om smärtan fortsätter ska han boka en tid.',
    tfQuestions: [
      {
        id: 'e3-q3',
        prompt: 'Jonas har redan bokat en tid på hälsocentralen.',
        type: 'boolean' as const,
        correctAnswer: 'False',
      },
      {
        id: 'e3-q4',
        prompt: 'Hans vän tycker att han ska vila.',
        type: 'boolean' as const,
        correctAnswer: 'True',
      },
    ],
    openAudio:
      'Stadens hälsomässa ordnas i idrottshallen den femte april. Besökarna kan kontrollera blodtryck, få råd om motion och prata med en dietist. För barn finns ett eget område med enkla aktiviteter. Mässan är öppen mellan tio och femton och inträdet är gratis. Arrangörerna vill göra det lättare för invånarna att tänka på sin hälsa i vardagen.',
    openQuestions: [
      {
        id: 'e3-q5',
        prompt: 'Vilka två saker kan besökarna göra på mässan?',
        type: 'short' as const,
        acceptedAnswers: ['kontrollera blodtryck', 'råd om motion', 'prata med en dietist'],
      },
      {
        id: 'e3-q6',
        prompt: 'Varför ordnas mässan?',
        type: 'short' as const,
        acceptedAnswers: ['lättare att tänka på sin hälsa', 'hälsa i vardagen', 'tänka på sin hälsa'],
      },
    ],
    writingOne:
      'Write to the health centre. Explain that you need to cancel an appointment, give a reason, and ask for a new appointment time.',
    writingTwo:
      'Write your opinion: should workplaces support employee exercise more actively? Explain why.',
    vocabulary: ['tidbokning', 'hälsocentral', 'smärta', 'motion', 'dietist', 'vardag'],
  },
  {
    id: 'exam-4',
    title: 'Mock Exam 4',
    theme: 'Workplace and schedules',
    shortAudio:
      'Hej allihop. På grund av leveransproblem börjar kvällsskiftet en timme senare i morgon. Ni ska alltså komma klockan fem i stället för klockan fyra. Om någon inte kan arbeta den nya tiden, meddela chefen före lunch.',
    shortQuestions: [
      {
        id: 'e4-q1',
        prompt: 'Vad ändras i morgon?',
        type: 'mcq' as const,
        options: ['Lönen', 'Kvällsskiftets starttid', 'Semesterlistan'],
        correctAnswer: 'Kvällsskiftets starttid',
      },
      {
        id: 'e4-q2',
        prompt: 'När ska man meddela chefen?',
        type: 'mcq' as const,
        options: ['Före lunch', 'Efter jobbet', 'Nästa vecka'],
        correctAnswer: 'Före lunch',
      },
    ],
    tfAudio:
      'Amina söker ett nytt jobb och pratar med sin vän Leo. Leo tycker att hennes cv är bra, men han säger att hon bör skriva mer om sina språkkunskaper och kundserviceerfarenhet. Amina vill också träna på att svara lugnt under en intervju.',
    tfQuestions: [
      {
        id: 'e4-q3',
        prompt: 'Leo tycker att Amina ska skriva mindre om sina erfarenheter.',
        type: 'boolean' as const,
        correctAnswer: 'False',
      },
      {
        id: 'e4-q4',
        prompt: 'Amina vill öva inför intervju.',
        type: 'boolean' as const,
        correctAnswer: 'True',
      },
    ],
    openAudio:
      'Arbetsförmedlingen erbjuder en kort kurs i jobbsökning för nya invånare. Kursen börjar den sjunde november och pågår i två veckor. Deltagarna lär sig skriva cv, söka jobb på nätet och öva intervjufrågor. Kursen är gratis, men det finns bara tjugo platser. Därför rekommenderar arbetsförmedlingen att man anmäler sig snabbt.',
    openQuestions: [
      {
        id: 'e4-q5',
        prompt: 'Vad lär sig deltagarna på kursen?',
        type: 'short' as const,
        acceptedAnswers: ['skriva cv', 'söka jobb', 'öva intervjufrågor'],
      },
      {
        id: 'e4-q6',
        prompt: 'Varför ska man anmäla sig snabbt?',
        type: 'short' as const,
        acceptedAnswers: ['bara tjugo platser', 'tjugo platser', 'få platser'],
      },
    ],
    writingOne:
      'Write an email to your manager. Explain that you need to swap one work shift, give a reason, and suggest a solution.',
    writingTwo:
      'Write your opinion: is customer service experience more important than formal education in some jobs? Give reasons.',
    vocabulary: ['skift', 'leverans', 'cv', 'intervju', 'språkkunskap', 'kundservice'],
  },
  {
    id: 'exam-5',
    title: 'Mock Exam 5',
    theme: 'Childcare and daily routines',
    shortAudio:
      'Förskolan meddelar att barnen ska vara ute längre än vanligt i morgon eftersom vädret blir fint. Ta därför med tunna handskar och en extra vattenflaska. Om ditt barn behöver medicin under dagen ska personalen få tydliga instruktioner på morgonen.',
    shortQuestions: [
      {
        id: 'e5-q1',
        prompt: 'Varför ska barnen vara ute längre?',
        type: 'mcq' as const,
        options: ['Det blir fint väder', 'Det finns inget rum inne', 'De ska resa bort'],
        correctAnswer: 'Det blir fint väder',
      },
      {
        id: 'e5-q2',
        prompt: 'Vad ska föräldrarna göra om barnet behöver medicin?',
        type: 'mcq' as const,
        options: ['Stanna hemma', 'Ge tydliga instruktioner', 'Köpa ny medicin'],
        correctAnswer: 'Ge tydliga instruktioner',
      },
    ],
    tfAudio:
      'Nora och hennes partner diskuterar hur de ska dela hämtning och lämning på förskolan. Nora börjar jobbet tidigt och vill därför att partnern lämnar barnet på morgonen. Partnern kan däremot sällan hämta på eftermiddagen. De bestämmer att Nora hämtar tre dagar i veckan och att morfar hjälper till på fredagar.',
    tfQuestions: [
      {
        id: 'e5-q3',
        prompt: 'Partnern kan lätt hämta barnet varje eftermiddag.',
        type: 'boolean' as const,
        correctAnswer: 'False',
      },
      {
        id: 'e5-q4',
        prompt: 'Morfar hjälper till på fredagar.',
        type: 'boolean' as const,
        correctAnswer: 'True',
      },
    ],
    openAudio:
      'Biblioteket ordnar sagostund för små barn varje lördag i sommar. Programmet börjar klockan elva och tar ungefär fyrtio minuter. Efter sagostunden får barnen pyssla tillsammans med sina föräldrar. Man behöver inte anmäla sig, men personalen rekommenderar att familjerna kommer i god tid eftersom rummet är litet.',
    openQuestions: [
      {
        id: 'e5-q5',
        prompt: 'Vad händer efter sagostunden?',
        type: 'short' as const,
        acceptedAnswers: ['barnen pysslar', 'pyssla tillsammans', 'pyssla'],
      },
      {
        id: 'e5-q6',
        prompt: 'Varför ska man komma i god tid?',
        type: 'short' as const,
        acceptedAnswers: ['rummet är litet', 'litet rum'],
      },
    ],
    writingOne:
      'Write to your child’s daycare. Explain that another adult will pick up your child, give the person’s name and relation, and ask what information the daycare needs.',
    writingTwo:
      'Write your opinion: should parents reduce children’s screen time more actively? Give reasons.',
    vocabulary: ['förskola', 'hämta', 'lämna', 'medicin', 'sagostund', 'skärmtid'],
  },
  {
    id: 'exam-6',
    title: 'Mock Exam 6',
    theme: 'Banking and personal finances',
    shortAudio:
      'Det här är ett meddelande från banken. Från och med nästa månad stänger kontoret på lördagar. Kunder som behöver personlig service kan boka tid via appen eller telefon. Bankomaten utanför kontoret fungerar som vanligt hela veckan.',
    shortQuestions: [
      {
        id: 'e6-q1',
        prompt: 'När sker förändringen?',
        type: 'mcq' as const,
        options: ['Från och med nästa månad', 'I morgon', 'Nästa år'],
        correctAnswer: 'Från och med nästa månad',
      },
      {
        id: 'e6-q2',
        prompt: 'Hur kan kunder boka personlig service?',
        type: 'mcq' as const,
        options: ['Via appen eller telefon', 'Bara via e-post', 'Bara på lördagar'],
        correctAnswer: 'Via appen eller telefon',
      },
    ],
    tfAudio:
      'Elin har svårt att hålla sin budget. Hon köper ofta mat ute och glömmer små utgifter. Hennes bror föreslår att hon skriver upp allt i en app under en månad. Elin tycker att det låter jobbigt, men hon inser att det kan hjälpa henne att spara till en resa.',
    tfQuestions: [
      {
        id: 'e6-q3',
        prompt: 'Elin har redan full kontroll över sina små utgifter.',
        type: 'boolean' as const,
        correctAnswer: 'False',
      },
      {
        id: 'e6-q4',
        prompt: 'Hon vill spara pengar till en resa.',
        type: 'boolean' as const,
        correctAnswer: 'True',
      },
    ],
    openAudio:
      'Kommunens konsumentrådgivning erbjuder gratis hjälp till personer som vill förstå sina avtal och räkningar bättre. Tjänsten är öppen tre dagar i veckan och man kan boka både telefonrådgivning och möten på plats. Rådgivarna hjälper särskilt personer som har problem med abonnemang, fakturor eller nätköp. Målet är att invånarna ska känna sig tryggare när de fattar ekonomiska beslut.',
    openQuestions: [
      {
        id: 'e6-q5',
        prompt: 'Vilka problem hjälper rådgivarna särskilt till med?',
        type: 'short' as const,
        acceptedAnswers: ['abonnemang', 'fakturor', 'nätköp'],
      },
      {
        id: 'e6-q6',
        prompt: 'Vad är målet med tjänsten?',
        type: 'short' as const,
        acceptedAnswers: ['känna sig tryggare', 'tryggare', 'ekonomiska beslut'],
      },
    ],
    writingOne:
      'Write to your bank. Explain that a payment has not gone through, describe what happened, and ask for help.',
    writingTwo:
      'Write your opinion: should schools teach more about personal finances? Give reasons.',
    vocabulary: ['budget', 'utgift', 'abonnemang', 'faktura', 'betalning', 'rådgivning'],
  },
  {
    id: 'exam-7',
    title: 'Mock Exam 7',
    theme: 'Public services and municipality life',
    shortAudio:
      'Kommunen informerar om att simhallen är stängd från den andra till den nionde augusti för årligt underhåll. Under den tiden gäller vanliga medlemskort även i den närmaste grannkommunens simhall. Mer information finns på kommunens webbplats.',
    shortQuestions: [
      {
        id: 'e7-q1',
        prompt: 'Varför stängs simhallen?',
        type: 'mcq' as const,
        options: ['På grund av tävling', 'För årligt underhåll', 'För att det är helg'],
        correctAnswer: 'För årligt underhåll',
      },
      {
        id: 'e7-q2',
        prompt: 'Vad gäller under stängningen?',
        type: 'mcq' as const,
        options: [
          'Medlemskortet fungerar i grannkommunens simhall',
          'Man får pengarna tillbaka',
          'Simhallen öppnar bara på kvällar',
        ],
        correctAnswer: 'Medlemskortet fungerar i grannkommunens simhall',
      },
    ],
    tfAudio:
      'Rami vill låna ett grupprum på biblioteket för att studera svenska med sina vänner. Bibliotekarien säger att rummet är gratis men att det måste bokas i förväg. Rami trodde att rummet bara var för universitetsstudenter, men det stämmer inte.',
    tfQuestions: [
      {
        id: 'e7-q3',
        prompt: 'Grupprummet kostar pengar.',
        type: 'boolean' as const,
        correctAnswer: 'False',
      },
      {
        id: 'e7-q4',
        prompt: 'Rami hade missförstått vem som får använda rummet.',
        type: 'boolean' as const,
        correctAnswer: 'True',
      },
    ],
    openAudio:
      'Medborgarinstitutet startar en kvällskurs i svenska för vuxna nybörjare. Kursen hålls två gånger i veckan under tio veckor. Deltagarna tränar vardaglig svenska, uttal och kort skrivning. Kursen passar personer som vill klara sig bättre i arbete, butik och myndighetskontakter. Det finns både dag- och kvällsgrupper, men kvällsgruppen blir ofta full först.',
    openQuestions: [
      {
        id: 'e7-q5',
        prompt: 'Vilka färdigheter tränar deltagarna?',
        type: 'short' as const,
        acceptedAnswers: ['vardaglig svenska', 'uttal', 'kort skrivning'],
      },
      {
        id: 'e7-q6',
        prompt: 'Vilken grupp blir ofta full först?',
        type: 'short' as const,
        acceptedAnswers: ['kvällsgruppen', 'kvällsgrupp'],
      },
    ],
    writingOne:
      'Write to the municipality. Explain that you want to join a Swedish course, ask about level, schedule, and registration.',
    writingTwo:
      'Write your opinion: should municipalities offer more low-cost language courses for adults? Explain why.',
    vocabulary: ['kommun', 'underhåll', 'bibliotek', 'bokning', 'medborgarinstitut', 'myndighetskontakt'],
  },
  {
    id: 'exam-8',
    title: 'Mock Exam 8',
    theme: 'Transport and travel',
    shortAudio:
      'Tåget till Åbo som skulle avgå 17.20 är försenat med trettio minuter på grund av tekniska problem. Resenärer som vill byta till buss kan göra det utan extra kostnad vid spår fyra. Följ informationstavlorna för uppdateringar.',
    shortQuestions: [
      {
        id: 'e8-q1',
        prompt: 'Hur lång är förseningen?',
        type: 'mcq' as const,
        options: ['Tio minuter', 'Trettiо minuter', 'En timme'],
        correctAnswer: 'Trettiо minuter',
      },
      {
        id: 'e8-q2',
        prompt: 'Vad kan resenärer göra?',
        type: 'mcq' as const,
        options: ['Byta till buss utan extra kostnad', 'Åka hem gratis taxi', 'Hämta pengar i kiosken'],
        correctAnswer: 'Byta till buss utan extra kostnad',
      },
    ],
    tfAudio:
      'Sofia cyklar vanligtvis till jobbet men funderar nu på att köpa månadskort för bussen till vintern. Hennes kollega säger att bussen ofta är pålitlig men ganska full på morgonen. Sofia gillar ändå tanken att slippa halka på vägen när det snöar.',
    tfQuestions: [
      {
        id: 'e8-q3',
        prompt: 'Sofia tar redan alltid bussen till jobbet.',
        type: 'boolean' as const,
        correctAnswer: 'False',
      },
      {
        id: 'e8-q4',
        prompt: 'Bussen kan vara full på morgonen.',
        type: 'boolean' as const,
        correctAnswer: 'True',
      },
    ],
    openAudio:
      'Turistinformationen ordnar en gratis stadsvandring för nya invånare nästa söndag. Vandringen börjar vid järnvägsstationen klockan tolv och tar ungefär två timmar. Guiden berättar om stadens historia, viktiga servicepunkter och billiga fritidsmöjligheter. Många deltagare använder vandringen för att lära känna staden bättre och samtidigt träna svenska i en naturlig situation.',
    openQuestions: [
      {
        id: 'e8-q5',
        prompt: 'Var börjar stadsvandringen?',
        type: 'short' as const,
        acceptedAnswers: ['vid järnvägsstationen', 'järnvägsstationen'],
      },
      {
        id: 'e8-q6',
        prompt: 'Varför deltar många i vandringen?',
        type: 'short' as const,
        acceptedAnswers: ['lära känna staden bättre', 'träna svenska', 'naturlig situation'],
      },
    ],
    writingOne:
      'Write to a transport company. Explain that your monthly card did not work, describe the situation, and ask for a solution.',
    writingTwo:
      'Write your opinion: should public transport be cheaper for new residents and job seekers? Give reasons.',
    vocabulary: ['försening', 'spår', 'månadskort', 'pålitlig', 'stadsvandring', 'servicepunkt'],
  },
  {
    id: 'exam-9',
    title: 'Mock Exam 9',
    theme: 'Neighbourhood and community',
    shortAudio:
      'Föreningen i området ordnar städdag på gården nu på lördag mellan tio och tretton. Handskar och sopsäckar finns på plats. Efter arbetet bjuds alla deltagare på kaffe och smörgås i gårdshuset.',
    shortQuestions: [
      {
        id: 'e9-q1',
        prompt: 'När ordnas städdagen?',
        type: 'mcq' as const,
        options: ['På fredag kväll', 'På lördag mellan tio och tretton', 'På söndag morgon'],
        correctAnswer: 'På lördag mellan tio och tretton',
      },
      {
        id: 'e9-q2',
        prompt: 'Vad händer efter arbetet?',
        type: 'mcq' as const,
        options: ['Alla går hem direkt', 'Det blir kaffe och smörgås', 'Det blir ett möte med polisen'],
        correctAnswer: 'Det blir kaffe och smörgås',
      },
    ],
    tfAudio:
      'Två grannar diskuterar ett problem med högt ljud sent på kvällarna. Den ena grannen tycker att man först ska tala lugnt med personen som spelar musik. Den andra vill skriva direkt till hyresvärden. De är ändå överens om att problemet måste lösas snabbt.',
    tfQuestions: [
      {
        id: 'e9-q3',
        prompt: 'Båda grannarna vill använda exakt samma lösning.',
        type: 'boolean' as const,
        correctAnswer: 'False',
      },
      {
        id: 'e9-q4',
        prompt: 'De tycker båda att situationen behöver lösas.',
        type: 'boolean' as const,
        correctAnswer: 'True',
      },
    ],
    openAudio:
      'Ett nytt frivilligprojekt startar i området för att hjälpa äldre med små inköp och promenader. Projektet söker både frivilliga och äldre som vill ha stöd. Alla deltagare får en kort introduktion om säkerhet och kontaktregler. Arrangörerna hoppas att projektet både ska minska ensamhet och skapa bättre kontakt mellan grannar i området.',
    openQuestions: [
      {
        id: 'e9-q5',
        prompt: 'Vem söker projektet?',
        type: 'short' as const,
        acceptedAnswers: ['frivilliga', 'äldre som vill ha stöd', 'äldre'],
      },
      {
        id: 'e9-q6',
        prompt: 'Vad hoppas arrangörerna på?',
        type: 'short' as const,
        acceptedAnswers: ['minska ensamhet', 'bättre kontakt mellan grannar', 'kontakt mellan grannar'],
      },
    ],
    writingOne:
      'Write to your neighbour or housing manager about repeated evening noise. Explain the problem politely and ask for a solution.',
    writingTwo:
      'Write your opinion: should neighbours know each other better in apartment buildings? Explain why.',
    vocabulary: ['förening', 'gård', 'hyresvärd', 'ensamhet', 'frivillig', 'grannar'],
  },
  {
    id: 'exam-10',
    title: 'Mock Exam 10',
    theme: 'Studies and future plans',
    shortAudio:
      'Studievägledningen meddelar att ansökningstiden till höstens yrkesutbildningar slutar den femtonde maj. Den som behöver hjälp med ansökan kan boka rådgivning varje tisdag och torsdag. Ta med tidigare betyg och identitetshandling till mötet.',
    shortQuestions: [
      {
        id: 'e10-q1',
        prompt: 'När slutar ansökningstiden?',
        type: 'mcq' as const,
        options: ['Den femtonde maj', 'Varje torsdag', 'Till hösten'],
        correctAnswer: 'Den femtonde maj',
      },
      {
        id: 'e10-q2',
        prompt: 'Vad ska man ta med till mötet?',
        type: 'mcq' as const,
        options: ['En dator och lunch', 'Tidigare betyg och identitetshandling', 'Bara ett cv'],
        correctAnswer: 'Tidigare betyg och identitetshandling',
      },
    ],
    tfAudio:
      'Bilal funderar på om han ska fortsätta arbeta heltid eller börja studera på deltid. Hans syster tycker att deltidsstudier kan vara ett bra steg eftersom han då kan behålla sin inkomst. Bilal är mest orolig för att han ska bli trött, men han gillar tanken att utvecklas.',
    tfQuestions: [
      {
        id: 'e10-q3',
        prompt: 'Bilals syster tycker att han ska säga upp sig direkt.',
        type: 'boolean' as const,
        correctAnswer: 'False',
      },
      {
        id: 'e10-q4',
        prompt: 'Bilal tänker på både ekonomi och ork.',
        type: 'boolean' as const,
        correctAnswer: 'True',
      },
    ],
    openAudio:
      'Ett lokalt företag samarbetar med yrkesskolan och erbjuder praktikplatser inom lager och logistik. Praktiken varar i sex veckor och deltagarna får handledning varje dag. Företaget säger att praktiken passar särskilt bra för personer som vill förstå arbetslivet i Finland bättre och samtidigt öva svenska på jobbet. Efter praktiken kan några deltagare erbjudas sommarjobb.',
    openQuestions: [
      {
        id: 'e10-q5',
        prompt: 'Hur länge varar praktiken?',
        type: 'short' as const,
        acceptedAnswers: ['sex veckor', '6 veckor'],
      },
      {
        id: 'e10-q6',
        prompt: 'Vad kan hända efter praktiken?',
        type: 'short' as const,
        acceptedAnswers: ['erbjudas sommarjobb', 'sommarjobb'],
      },
    ],
    writingOne:
      'Write to a study advisor. Explain what you want to study, say what background you have, and ask what level of Swedish is needed.',
    writingTwo:
      'Write your opinion: is it better to study and work at the same time, or focus on one thing first? Give reasons.',
    vocabulary: ['ansökningstid', 'rådgivning', 'yrkesutbildning', 'deltid', 'praktik', 'handledning'],
  },
]

const phraseBank = [
  'Jag skriver för att ...',
  'Jag skulle vilja få information om ...',
  'Problemet är att ...',
  'För det första ...',
  'Dessutom ...',
  'Till exempel ...',
  'Därför tycker jag att ...',
  'Vänliga hälsningar',
]

const phraseGuide: Record<
  string,
  { english: string; why: string; memory: string }
> = {
  'Jag skriver för att ...': {
    english: 'I am writing because ...',
    why: 'Use this to start almost any practical email.',
    memory: 'Think: WRITE = why you write.',
  },
  'Jag skulle vilja få information om ...': {
    english: 'I would like to get information about ...',
    why: 'Use this when you ask for details, help, or instructions.',
    memory: 'Think: INFO = I need information.',
  },
  'Problemet är att ...': {
    english: 'The problem is that ...',
    why: 'Use this to explain the main issue clearly in one sentence.',
    memory: 'Think: PROBLEM = one clear trouble.',
  },
  'För det första ...': {
    english: 'First of all ...',
    why: 'Use this to begin your first reason in an opinion text.',
    memory: 'Think: FIRST = reason 1.',
  },
  'Dessutom ...': {
    english: 'In addition ...',
    why: 'Use this to add one more reason or detail.',
    memory: 'Think: ADD = extra reason.',
  },
  'Till exempel ...': {
    english: 'For example ...',
    why: 'Use this to give one easy real-life example.',
    memory: 'Think: EXAMPLE = one real case.',
  },
  'Därför tycker jag att ...': {
    english: 'Therefore I think that ...',
    why: 'Use this to connect your reasons to your opinion.',
    memory: 'Think: THEREFORE = conclusion idea.',
  },
  'Vänliga hälsningar': {
    english: 'Kind regards',
    why: 'Use this to end a formal or polite message.',
    memory: 'Think: END = polite closing.',
  },
}

const writingShortcutTips = [
  {
    title: 'Email Formula',
    sign: 'H + P + D + A + C',
    explanation:
      'Remember only 5 things: Hello, Problem, Details, Ask, Close. This is enough for many writing tasks.',
  },
  {
    title: 'Opinion Formula',
    sign: 'O + 3R + E + C',
    explanation:
      'Remember only 4 things: Opinion, 3 Reasons, 1 Example, Conclusion. You do not need fancy Swedish.',
  },
  {
    title: 'Simple Pass Rule',
    sign: 'Clear > Clever',
    explanation:
      'Short correct Swedish is better than complicated Swedish with many mistakes.',
  },
  {
    title: 'Never Blank',
    sign: 'Write Something',
    explanation:
      'If you do not know a perfect sentence, write a simple one. A simple answer can still get points.',
  },
]

const alwaysRememberList = [
  'In a practical email, always write: what happened, how long, why difficult, what help you want.',
  'In an opinion text, always write: what you think, why, one example, one short ending.',
  'If time is short, use 5-7 short sentences instead of one long complicated paragraph.',
  'Repeat useful connector words because they make your text look organized.',
]

const listeningShortcutTips = [
  {
    title: '5-key listening rule',
    sign: 'W + T + P + R + A',
    explanation:
      'Listen for Who, Time, Place, Reason, Action. You do not need every word to answer many YKI listening questions.',
  },
  {
    title: 'True/False shortcut',
    sign: 'Same or Different',
    explanation:
      'Do not panic. Compare the statement with the audio idea. Ask: is it the same idea or a different idea?',
  },
  {
    title: 'Short answer shortcut',
    sign: '2-4 Words',
    explanation:
      'For short answers, write only the key words. Usually you do not need long sentences.',
  },
  {
    title: 'Replay strategy',
    sign: '1st big idea, 2nd details',
    explanation:
      'First listening: understand topic and situation. Second listening: catch times, places, names, and actions.',
  },
]

const listeningAlwaysRemember = [
  'A listening task often wants a fact, not the whole story.',
  'If you hear time, date, place, or phone number, that is often important.',
  'Words like eftersom, därför, men, måste often show the answer direction.',
  'In many practical messages, the last sentence contains the action you must do.',
]

const listeningTopicList = [
  'housing and repairs',
  'school and daycare',
  'health centre and appointments',
  'work shifts and schedules',
  'transport and delays',
  'bank, bills, and money',
  'municipality, courses, and registration',
  'neighbours, noise, and building rules',
]

const writingTopicPractice = [
  {
    title: 'Practical Email Topics',
    items: [
      'housing company: smell, water, noise, repair',
      'school or daycare: absence, pickup, information',
      'health centre: cancel, move, ask for a new appointment',
      'manager: shift change, absence, work schedule',
      'municipality or course organiser: ask about level, time, registration',
    ],
  },
  {
    title: 'Opinion Topics',
    items: [
      'home and neighbour rules',
      'children and homework',
      'screen time',
      'public transport',
      'language courses and integration',
      'work and study balance',
    ],
  },
]

const bilingualWritingTopics = [
  {
    title: 'Practical Email Topics',
    titleSv: 'Praktiska e-postteman',
    formula: 'H + P + D + A + C',
    topics: [
      {
        sv: 'bostadsbolag: lukt, vatten, buller, reparation',
        en: 'housing company: smell, water, noise, repair',
        answerSv:
          'Hej,\n\nJag skriver för att vi har ett problem i lägenheten. Det luktar starkt i badrummet och väggen är våt efter duschen. Problemet har funnits i två veckor.\n\nKan ni skicka någon för att kontrollera badrummet?\n\nVänliga hälsningar,',
        answerEn:
          'Hello,\n\nI am writing because we have a problem in the apartment. There is a strong smell in the bathroom and the wall is wet after showering. The problem has lasted for two weeks.\n\nCould you send someone to check the bathroom?\n\nKind regards,',
        trick: 'Remember: problem + how long + ask for repair.',
        keywords: ['problem', 'badrummet', 'två veckor', 'kontrollera', 'repair'],
      },
      {
        sv: 'skola eller daghem: frånvaro, hämtning, information',
        en: 'school or daycare: absence, pickup, information',
        answerSv:
          'Hej,\n\nJag skriver eftersom mitt barn var frånvarande i dag. Jag vill också meddela att moster Lina hämtar barnet i eftermiddag.\n\nKan ni skicka information om vad barnet har missat?\n\nVänliga hälsningar,',
        answerEn:
          'Hello,\n\nI am writing because my child was absent today. I also want to inform you that Aunt Lina will pick up the child this afternoon.\n\nCould you send information about what the child has missed?\n\nKind regards,',
        trick: 'Remember: absence or pickup + ask for information.',
        keywords: ['frånvarande', 'hämtar', 'information', 'child', 'information'],
      },
      {
        sv: 'hälsocentral: avboka, flytta tid, be om ny tid',
        en: 'health centre: cancel, move, ask for a new appointment',
        answerSv:
          'Hej,\n\nJag måste tyvärr avboka min tid på fredag eftersom jag är bortrest. Jag vill gärna boka en ny tid nästa vecka.\n\nKan ni ge mig en ny tid på eftermiddagen?\n\nVänliga hälsningar,',
        answerEn:
          'Hello,\n\nUnfortunately, I need to cancel my appointment on Friday because I will be away. I would like to book a new appointment next week.\n\nCould you give me a new time in the afternoon?\n\nKind regards,',
        trick: 'Remember: cancel + reason + new time request.',
        keywords: ['avboka', 'ny tid', 'eftermiddagen', 'cancel', 'new appointment'],
      },
      {
        sv: 'chef: byte av arbetsskift, frånvaro, arbetsschema',
        en: 'manager: shift change, absence, work schedule',
        answerSv:
          'Hej,\n\nJag skriver eftersom jag behöver byta mitt arbetsskift på torsdag. Jag har ett viktigt möte och kan inte arbeta på kvällen.\n\nÄr det möjligt att arbeta morgonskiftet i stället?\n\nVänliga hälsningar,',
        answerEn:
          'Hello,\n\nI am writing because I need to change my work shift on Thursday. I have an important meeting and cannot work in the evening.\n\nIs it possible to work the morning shift instead?\n\nKind regards,',
        trick: 'Remember: shift + reason + suggested solution.',
        keywords: ['byta', 'arbetsskift', 'morgonskiftet', 'shift', 'solution'],
      },
      {
        sv: 'kommun eller kursarrangör: fråga om nivå, tid, anmälan',
        en: 'municipality or course organiser: ask about level, time, registration',
        answerSv:
          'Hej,\n\nJag är intresserad av kursen i svenska. Jag vill gärna veta vilken nivå kursen har, när den börjar och hur man anmäler sig.\n\nKan ni skicka mer information?\n\nVänliga hälsningar,',
        answerEn:
          'Hello,\n\nI am interested in the Swedish course. I would like to know what level the course is, when it starts, and how to register.\n\nCould you send more information?\n\nKind regards,',
        trick: 'Remember: level + time + registration.',
        keywords: ['nivå', 'börjar', 'anmäler', 'level', 'register'],
      },
      {
        sv: 'hyresvärd: värmen fungerar inte, kall lägenhet',
        en: 'landlord: heating does not work, cold apartment',
        answerSv:
          'Hej,\n\nJag skriver för att värmen inte fungerar i min lägenhet. Det är mycket kallt i sovrummet och köket, särskilt på kvällen. Problemet började i måndags.\n\nKan ni skicka någon för att kontrollera elementen så snart som möjligt?\n\nVänliga hälsningar,',
        answerEn:
          'Hello,\n\nI am writing because the heating does not work in my apartment. It is very cold in the bedroom and kitchen, especially in the evening. The problem started on Monday.\n\nCould you send someone to check the radiators as soon as possible?\n\nKind regards,',
        trick: 'Remember: what is broken + where + since when + repair request.',
        keywords: ['värmen', 'kallt', 'måndags', 'heating', 'cold apartment'],
      },
      {
        sv: 'bank: fel på räkning eller dubbel betalning',
        en: 'bank: bill problem or double payment',
        answerSv:
          'Hej,\n\nJag har märkt ett problem med min betalning. Samma räkning verkar ha betalats två gånger från mitt konto i går.\n\nKan ni kontrollera detta och berätta vad jag ska göra nu?\n\nVänliga hälsningar,',
        answerEn:
          'Hello,\n\nI have noticed a problem with my payment. The same bill seems to have been paid twice from my account yesterday.\n\nCould you check this and tell me what I should do now?\n\nKind regards,',
        trick: 'Remember: what happened + when + ask bank to check.',
        keywords: ['betalning', 'två gånger', 'konto', 'payment', 'twice'],
      },
      {
        sv: 'transportbolag: försenat busskort eller biljettproblem',
        en: 'transport company: travel card delay or ticket problem',
        answerSv:
          'Hej,\n\nMitt busskort fungerade inte i morse när jag skulle till jobbet. Jag fick ett felmeddelande trots att kortet fortfarande är giltigt.\n\nKan ni hjälpa mig att lösa problemet eller förklara hur jag kan få ett nytt kort?\n\nVänliga hälsningar,',
        answerEn:
          'Hello,\n\nMy bus card did not work this morning when I was going to work. I got an error message even though the card is still valid.\n\nCould you help me solve the problem or explain how I can get a new card?\n\nKind regards,',
        trick: 'Remember: card problem + effect + ask for solution.',
        keywords: ['busskort', 'felmeddelande', 'giltigt', 'bus card', 'new card'],
      },
      {
        sv: 'bibliotek eller kursplats: boka plats eller fråga om schema',
        en: 'library or course centre: book a place or ask about schedule',
        answerSv:
          'Hej,\n\nJag vill gärna delta i er kurs nästa månad. Jag undrar om det fortfarande finns lediga platser och vilka tider kursen hålls.\n\nKan ni skicka schemat till mig?\n\nVänliga hälsningar,',
        answerEn:
          'Hello,\n\nI would like to join your course next month. I wonder if there are still free places and at what times the course is held.\n\nCould you send the schedule to me?\n\nKind regards,',
        trick: 'Remember: interest + place + schedule request.',
        keywords: ['lediga platser', 'tider', 'schemat', 'free places', 'schedule'],
      },
      {
        sv: 'daghem eller skola: allergi, specialmat, viktig information',
        en: 'daycare or school: allergy, special food, important information',
        answerSv:
          'Hej,\n\nJag vill informera om att mitt barn är allergiskt mot nötter. Därför behöver barnet specialmat i skolan.\n\nKan ni bekräfta att informationen har kommit fram till rätt person?\n\nVänliga hälsningar,',
        answerEn:
          'Hello,\n\nI want to inform you that my child is allergic to nuts. Therefore, the child needs special food at school.\n\nCould you confirm that this information has reached the right person?\n\nKind regards,',
        trick: 'Remember: important health info + need + confirmation.',
        keywords: ['allergiskt', 'specialmat', 'bekräfta', 'allergic', 'special food'],
      },
    ] as WritingPracticeTopic[],
  },
  {
    title: 'Opinion Topics',
    titleSv: 'Åsiktsteman',
    formula: 'O + 3R + E + C',
    topics: [
      {
        sv: 'regler hemma och mellan grannar',
        en: 'home and neighbour rules',
        answerSv:
          'Jag tycker att tydliga regler mellan grannar är viktiga. För det första blir det lugnare i huset. För det andra minskar konflikter. Till exempel är det lättare att sova om det är tyst på kvällen. Därför tycker jag att regler behövs.',
        answerEn:
          'I think clear rules between neighbours are important. First, the building becomes calmer. Second, conflicts decrease. For example, it is easier to sleep if it is quiet in the evening. Therefore, I think rules are needed.',
        trick: 'Remember: opinion + 2 reasons + 1 example + ending.',
        keywords: ['regler', 'grannar', 'lugnt', 'rules', 'neighbours'],
      },
      {
        sv: 'barn och läxor',
        en: 'children and homework',
        answerSv:
          'Jag tycker att barn borde ha mindre läxor. För det första behöver de vila efter skolan. Dessutom behöver de tid för familj och fritid. Till exempel är många barn trötta på kvällen. Därför tycker jag att kortare läxor är bättre.',
        answerEn:
          'I think children should have less homework. First, they need rest after school. In addition, they need time for family and free time. For example, many children are tired in the evening. Therefore, I think shorter homework is better.',
        trick: 'Remember: rest + family/free time + tired example.',
        keywords: ['läxor', 'vila', 'trötta', 'homework', 'rest'],
      },
      {
        sv: 'skärmtid',
        en: 'screen time',
        answerSv:
          'Jag tycker att för mycket skärmtid är dåligt. För det första sover barn sämre. För det andra rör de sig mindre. Till exempel använder många barn telefonen sent på kvällen. Därför behövs tydliga regler hemma.',
        answerEn:
          'I think too much screen time is bad. First, children sleep worse. Second, they move less. For example, many children use the phone late in the evening. Therefore, clear rules are needed at home.',
        trick: 'Remember: sleep + movement + home rules.',
        keywords: ['skärmtid', 'sover', 'regler', 'screen time', 'sleep'],
      },
      {
        sv: 'kollektivtrafik',
        en: 'public transport',
        answerSv:
          'Jag tycker att kollektivtrafiken borde vara billigare. För det första hjälper det människor med liten ekonomi. Dessutom blir det lättare att resa till jobb och skola. Till exempel behöver arbetssökande ofta resa mycket. Därför är billigare biljetter en bra idé.',
        answerEn:
          'I think public transport should be cheaper. First, it helps people with little money. In addition, it becomes easier to travel to work and school. For example, job seekers often need to travel a lot. Therefore, cheaper tickets are a good idea.',
        trick: 'Remember: money + access + job seeker example.',
        keywords: ['kollektivtrafiken', 'billigare', 'biljetter', 'public transport', 'cheaper'],
      },
      {
        sv: 'språkkurser och integration',
        en: 'language courses and integration',
        answerSv:
          'Jag tycker att fler språkkurser behövs. För det första hjälper språket i vardagen. För det andra blir det lättare att hitta jobb. Till exempel vågar människor tala mer efter en kurs. Därför är språkkurser viktiga för integration.',
        answerEn:
          'I think more language courses are needed. First, language helps in everyday life. Second, it becomes easier to find work. For example, people dare to speak more after a course. Therefore, language courses are important for integration.',
        trick: 'Remember: daily life + work + confidence example.',
        keywords: ['språkkurser', 'jobb', 'integration', 'language courses', 'integration'],
      },
      {
        sv: 'balans mellan arbete och studier',
        en: 'work and study balance',
        answerSv:
          'Jag tycker att det kan vara bra att arbeta och studera samtidigt. För det första får man både erfarenhet och kunskap. Dessutom kan man tjäna pengar. Till exempel kan deltidsarbete hjälpa under studietiden. Därför är kombinationen bra för många.',
        answerEn:
          'I think it can be good to work and study at the same time. First, you get both experience and knowledge. In addition, you can earn money. For example, part-time work can help during studies. Therefore, the combination is good for many people.',
        trick: 'Remember: experience + money + part-time example.',
        keywords: ['arbeta', 'studera', 'pengar', 'work', 'study'],
      },
      {
        sv: 'återvinning och miljö',
        en: 'recycling and environment',
        answerSv:
          'Jag tycker att återvinning är mycket viktigt. För det första blir miljön renare. För det andra lär sig människor att ta ansvar. Till exempel kan fler återvinningsstationer göra det lättare att sortera rätt. Därför borde staden satsa mer på återvinning.',
        answerEn:
          'I think recycling is very important. First, the environment becomes cleaner. Second, people learn to take responsibility. For example, more recycling stations can make it easier to sort correctly. Therefore, the city should invest more in recycling.',
        trick: 'Remember: cleaner environment + responsibility + one example.',
        keywords: ['återvinning', 'miljön', 'sortera', 'recycling', 'environment'],
      },
      {
        sv: 'fler idrottsaktiviteter för barn',
        en: 'more sports activities for children',
        answerSv:
          'Jag tycker att barn borde ha fler idrottsaktiviteter. För det första är motion bra för hälsan. Dessutom träffar barn nya vänner genom sport. Till exempel kan en billig fotbollsklubb hjälpa många familjer. Därför borde kommunen ordna fler aktiviteter.',
        answerEn:
          'I think children should have more sports activities. First, exercise is good for health. In addition, children meet new friends through sports. For example, a low-cost football club can help many families. Therefore, the municipality should organise more activities.',
        trick: 'Remember: health + friends + local example.',
        keywords: ['idrottsaktiviteter', 'motion', 'vänner', 'sports', 'health'],
      },
      {
        sv: 'digitala tjänster och myndigheter',
        en: 'digital services and authorities',
        answerSv:
          'Jag tycker att digitala tjänster är bra men de måste vara enkla. För det första sparar de tid. För det andra blir det lättare att boka tider och läsa viktig information. Till exempel använder många människor mobilen för att kontakta myndigheter. Därför måste tjänsterna vara tydliga för alla.',
        answerEn:
          'I think digital services are good, but they must be simple. First, they save time. Second, it becomes easier to book appointments and read important information. For example, many people use their mobile phone to contact authorities. Therefore, the services must be clear for everyone.',
        trick: 'Remember: simple + save time + clear for everyone.',
        keywords: ['digitala tjänster', 'tid', 'myndigheter', 'digital services', 'authorities'],
      },
      {
        sv: 'vårdköer och väntetider',
        en: 'healthcare queues and waiting times',
        answerSv:
          'Jag tycker att väntetiderna i vården borde bli kortare. För det första blir människor stressade när de väntar länge. Dessutom kan problem bli värre utan snabb hjälp. Till exempel är det svårt att arbeta om man har ont men inte får en tid. Därför behövs snabbare service.',
        answerEn:
          'I think waiting times in healthcare should be shorter. First, people become stressed when they wait a long time. In addition, problems can become worse without quick help. For example, it is difficult to work when you are in pain but cannot get an appointment. Therefore, faster service is needed.',
        trick: 'Remember: stress + worse problems + pain example.',
        keywords: ['väntetiderna', 'vården', 'snabbare', 'waiting times', 'healthcare'],
      },
      {
        sv: 'arbete hemifrån eller på arbetsplatsen',
        en: 'working from home or at the workplace',
        answerSv:
          'Jag tycker att arbete hemifrån passar vissa människor bra. För det första sparar man restid. För det andra kan det vara lättare att koncentrera sig hemma. Till exempel arbetar många bättre utan högt kontorsljud. Därför borde fler arbetsplatser erbjuda flexibilitet.',
        answerEn:
          'I think working from home suits some people well. First, you save travel time. Second, it can be easier to concentrate at home. For example, many people work better without loud office noise. Therefore, more workplaces should offer flexibility.',
        trick: 'Remember: save time + focus + office example.',
        keywords: ['hemifrån', 'restid', 'koncentrera', 'from home', 'concentrate'],
      },
    ] as WritingPracticeTopic[],
  },
]

const writingMiniTemplates = [
  {
    title: 'Practical Email Skeleton',
    sign: 'Hej -> Problem -> Detail -> Ask -> Bye',
    text:
      'Hej,\n\nJag skriver för att ...\nProblemet är att ...\nDet har pågått i ...\nKan ni hjälpa mig / ge information om ...?\n\nVänliga hälsningar,',
  },
  {
    title: 'Opinion Skeleton',
    sign: 'Opinion -> 3 Reasons -> Example -> End',
    text:
      'Jag tycker att ...\nFör det första ...\nDessutom ...\nTill exempel ...\nDärför tycker jag att ...',
  },
]

const writingPracticeTaskDetails: Record<
  string,
  { patternSv: string; instructionSv: string; promptSv: string; checklist: string[] }
> = {
  'bostadsbolag: lukt, vatten, buller, reparation': {
    patternSv: 'Praktiskt meddelande',
    instructionSv:
      'Du bor i en lägenhet. Det luktar i badrummet och väggen blir våt efter duschen. Skriv ett mejl till bostadsbolaget. Berätta vad problemet är, hur länge det har varit så och be om hjälp.',
    promptSv: 'Skriv ett tydligt mejl till bostadsbolaget. Svara på alla delar och avsluta artigt.',
    checklist: [
      'Vad är problemet?',
      'Hur länge har det pågått?',
      'Varför är det svårt?',
      'Vad vill du att de ska göra?',
    ],
  },
  'skola eller daghem: frånvaro, hämtning, information': {
    patternSv: 'Praktiskt meddelande',
    instructionSv:
      'Skriv till skola eller daghem. Berätta om frånvaro eller hämtning och fråga om den information du behöver.',
    promptSv: 'Skriv ett kort och artigt meddelande. Avsluta med en tydlig fråga.',
    checklist: [
      'Vilken situation gäller (frånvaro eller hämtning)?',
      'Vilken information behöver du?',
      'Vem gäller meddelandet?',
      'Vilken tydlig fråga avslutar texten?',
    ],
  },
  'hälsocentral: avboka, flytta tid, be om ny tid': {
    patternSv: 'Praktiskt meddelande',
    instructionSv:
      'Skriv till hälsocentralen. Berätta att du måste avboka eller flytta en tid, ge en orsak och be om en ny tid.',
    promptSv: 'Skriv ett tydligt meddelande och avsluta artigt.',
    checklist: [
      'Vilken tid gäller det?',
      'Varför måste tiden flyttas?',
      'När kan du komma i stället?',
      'Ber du tydligt om en ny tid?',
    ],
  },
  'chef: byte av arbetsskift, frånvaro, arbetsschema': {
    patternSv: 'Praktiskt meddelande',
    instructionSv:
      'Skriv till din chef. Berätta att du behöver byta arbetsskift eller att du är frånvarande. Ge en orsak och föreslå en lösning.',
    promptSv: 'Skriv ett tydligt och professionellt meddelande.',
    checklist: [
      'Vilken arbetstid behöver ändras?',
      'Vad är orsaken?',
      'Vilken lösning föreslår du?',
      'Är tonen artig och tydlig?',
    ],
  },
  'kommun eller kursarrangör: fråga om nivå, tid, anmälan': {
    patternSv: 'Praktiskt meddelande',
    instructionSv:
      'Skriv till kommunen eller kursarrangören och fråga om nivå, schema och hur anmälan går till.',
    promptSv: 'Skriv ett tydligt informationsmejl. Ställ korta, tydliga frågor och avsluta artigt.',
    checklist: [
      'Vilken kurs eller tjänst gäller det?',
      'Vilken nivå vill du fråga om?',
      'Frågar du om tid/schemat?',
      'Frågar du tydligt om anmälan?',
    ],
  },
}

const writingMemoryRules = [
  'Remember structure first, vocabulary second.',
  'If you know 5 strong phrases, you can write many different answers.',
  'A short organized text is safer than a long messy text.',
  'Most practical tasks repeat the same needs: explain, describe, ask.',
]

const listeningPracticeGroups = [
  {
    title: 'Short Message Topics',
    titleSv: 'Korta meddelanden',
    formula: 'W + T + P + R + A',
    topics: [
      {
        id: 'lp-1',
        sv: 'bostadsbolag: låsbyte och nyckel',
        en: 'housing company: lock change and key',
        transcriptSv:
          'Hej, det här är Sara från bostadsbolaget. På torsdag klockan åtta börjar vi byta lås i huset. Du behöver vara hemma eller lämna nyckeln på kontoret senast onsdag eftermiddag.',
        transcriptEn:
          'Hello, this is Sara from the housing company. On Thursday at eight o’clock we will start changing the locks in the building. You need to be at home or leave the key at the office by Wednesday afternoon.',
        trick: 'Catch time + action. The last sentence often tells what you must do.',
        keywords: ['torsdag', 'klockan åtta', 'nyckeln', 'Thursday', 'key'],
        listenFor: ['who is speaking', 'when it happens', 'what action you must do'],
        questions: [
          {
            id: 'lp-1-q1',
            prompt: 'När börjar låsbytet?',
            type: 'mcq',
            options: ['På torsdag klockan åtta', 'På onsdag eftermiddag', 'På fredag kväll'],
            correctAnswer: 'På torsdag klockan åtta',
          },
          {
            id: 'lp-1-q2',
            prompt: 'Vad måste personen göra?',
            type: 'short',
            acceptedAnswers: ['vara hemma', 'lämna nyckeln', 'nyckeln på kontoret'],
          },
        ],
      },
      {
        id: 'lp-2',
        sv: 'skola: utflykt och vad barnen ska ta med',
        en: 'school: class trip and what children should bring',
        transcriptSv:
          'Hej! Skolan meddelar att klass 6 åker på utflykt nästa tisdag. Bussen går klockan nio från skolgården. Barnen ska ha med matsäck, regnjacka och vattenflaska.',
        transcriptEn:
          'Hello! The school announces that class 6 is going on a trip next Tuesday. The bus leaves at nine o’clock from the school yard. The children should bring a packed meal, a rain jacket, and a water bottle.',
        trick: 'For school messages, listen for time, place, and what to bring.',
        keywords: ['nästa tisdag', 'klockan nio', 'matsäck', 'next Tuesday', 'packed meal'],
        listenFor: ['day', 'departure time', 'items to bring'],
        questions: [
          {
            id: 'lp-2-q1',
            prompt: 'När går bussen?',
            type: 'mcq',
            options: ['Klockan nio', 'Klockan åtta', 'Halv tre'],
            correctAnswer: 'Klockan nio',
          },
          {
            id: 'lp-2-q2',
            prompt: 'Vad ska barnen ta med?',
            type: 'short',
            acceptedAnswers: ['matsäck', 'regnjacka', 'vattenflaska'],
          },
        ],
      },
      {
        id: 'lp-3',
        sv: 'hälsocentral: ändrad tid',
        en: 'health centre: changed appointment',
        transcriptSv:
          'Hej, du har kommit till tandkliniken. Din tid på fredag måste flyttas eftersom tandläkaren är sjuk. Ring tillbaka före klockan sexton i dag.',
        transcriptEn:
          'Hello, you have reached the dental clinic. Your appointment on Friday must be moved because the dentist is ill. Call back before sixteen today.',
        trick: 'Listen for reason + new action. Medical messages often change time or place.',
        keywords: ['fredag', 'sjuk', 'före klockan sexton', 'Friday', 'before sixteen'],
        listenFor: ['why the time changes', 'what you must do next'],
        questions: [
          {
            id: 'lp-3-q1',
            prompt: 'Varför ändras tiden?',
            type: 'mcq',
            options: ['Tandläkaren är sjuk', 'Kliniken är stängd', 'Patienten är sen'],
            correctAnswer: 'Tandläkaren är sjuk',
          },
          {
            id: 'lp-3-q2',
            prompt: 'När ska man ringa tillbaka?',
            type: 'short',
            acceptedAnswers: ['före klockan sexton', 'i dag', 'före sexton'],
          },
        ],
      },
      {
        id: 'lp-4',
        sv: 'arbete: kvällsskift ändras',
        en: 'work: evening shift changes',
        transcriptSv:
          'Hej allihop. På grund av leveransproblem börjar kvällsskiftet en timme senare i morgon. Om någon inte kan arbeta den nya tiden, meddela chefen före lunch.',
        transcriptEn:
          'Hello everyone. Because of delivery problems, the evening shift starts one hour later tomorrow. If someone cannot work at the new time, inform the manager before lunch.',
        trick: 'Work messages often hide the answer in reason + new schedule + deadline.',
        keywords: ['en timme senare', 'i morgon', 'före lunch', 'one hour later', 'before lunch'],
        listenFor: ['what changed', 'when it changed', 'deadline to respond'],
        questions: [
          {
            id: 'lp-4-q1',
            prompt: 'Vad ändras?',
            type: 'mcq',
            options: ['Kvällsskiftets starttid', 'Lönen', 'Semestern'],
            correctAnswer: 'Kvällsskiftets starttid',
          },
          {
            id: 'lp-4-q2',
            prompt: 'När ska man meddela chefen?',
            type: 'short',
            acceptedAnswers: ['före lunch', 'innan lunch'],
          },
        ],
      },
    ] as ListeningPracticeTopic[],
  },
  {
    title: 'Conversation Topics',
    titleSv: 'Samtal',
    formula: 'Same or Different',
    topics: [
      {
        id: 'lp-5',
        sv: 'tvättstuga: problem och åsikter',
        en: 'laundry room: problem and opinions',
        transcriptSv:
          'Mikael pratar med sin granne om ett problem i tvättstugan. Maskinerna fungerar ofta dåligt och bokningssystemet är svårt att använda. Grannen vill köpa två nya maskiner, men Mikael vill först tala med styrelsen.',
        transcriptEn:
          'Mikael talks with his neighbour about a problem in the laundry room. The machines often work badly and the booking system is difficult to use. The neighbour wants to buy two new machines, but Mikael first wants to talk to the board.',
        trick: 'In conversations, compare each person’s opinion. True/false often changes one small detail.',
        keywords: ['granne', 'tvättstugan', 'två nya maskiner', 'neighbour', 'two new machines'],
        listenFor: ['who wants what', 'problem', 'different opinion'],
        questions: [
          {
            id: 'lp-5-q1',
            prompt: 'Grannen vill köpa två nya maskiner.',
            type: 'boolean',
            options: ['True', 'False'],
            correctAnswer: 'True',
          },
          {
            id: 'lp-5-q2',
            prompt: 'Vad vill Mikael göra först?',
            type: 'short',
            acceptedAnswers: ['tala med styrelsen', 'prata med styrelsen'],
          },
        ],
      },
      {
        id: 'lp-6',
        sv: 'läxor hemma: kompromiss mellan förälder och barn',
        en: 'homework at home: compromise between parent and child',
        transcriptSv:
          'Fatima och hennes son pratar om läxor. Sonen vill spela spel direkt efter skolan, men Fatima vill att han först läser svenska. De bestämmer att han får vila en stund och sedan göra läxan.',
        transcriptEn:
          'Fatima and her son talk about homework. The son wants to play games directly after school, but Fatima wants him to study Swedish first. They decide that he can rest for a while and then do the homework.',
        trick: 'Listen for the final decision, not only the first opinion.',
        keywords: ['spela spel', 'läser svenska', 'bestämmer', 'play games', 'decide'],
        listenFor: ['first wish', 'second wish', 'final compromise'],
        questions: [
          {
            id: 'lp-6-q1',
            prompt: 'Sonen vill spela spel direkt efter skolan.',
            type: 'boolean',
            options: ['True', 'False'],
            correctAnswer: 'True',
          },
          {
            id: 'lp-6-q2',
            prompt: 'Vad bestämmer de till slut?',
            type: 'short',
            acceptedAnswers: ['vila', 'göra läxan', 'först vila'],
          },
        ],
      },
      {
        id: 'lp-7',
        sv: 'jobbsökning: cv och intervju',
        en: 'job search: CV and interview',
        transcriptSv:
          'Amina söker ett nytt jobb och pratar med sin vän Leo. Leo säger att hon bör skriva mer om sina språkkunskaper och kundserviceerfarenhet. Amina vill också öva intervjufrågor.',
        transcriptEn:
          'Amina is looking for a new job and talks with her friend Leo. Leo says she should write more about her language skills and customer service experience. Amina also wants to practise interview questions.',
        trick: 'Job conversations often test what advice was given and what the person plans to do.',
        keywords: ['språkkunskaper', 'kundservice', 'intervjufrågor', 'language skills', 'interview'],
        listenFor: ['advice', 'skills', 'next step'],
        questions: [
          {
            id: 'lp-7-q1',
            prompt: 'Vad säger Leo att Amina ska skriva mer om?',
            type: 'short',
            acceptedAnswers: ['språkkunskaper', 'kundserviceerfarenhet', 'kundservice'],
          },
          {
            id: 'lp-7-q2',
            prompt: 'Amina vill öva intervjufrågor.',
            type: 'boolean',
            options: ['True', 'False'],
            correctAnswer: 'True',
          },
        ],
      },
    ] as ListeningPracticeTopic[],
  },
  {
    title: 'Information Clip Topics',
    titleSv: 'Informationsmeddelanden',
    formula: '2-4 Words',
    topics: [
      {
        id: 'lp-8',
        sv: 'återvinningsstation: plats och syfte',
        en: 'recycling station: place and purpose',
        transcriptSv:
          'Kommunen informerar om en ny återvinningsstation i området. Stationen öppnar den tredje juni bredvid matbutiken. Kommunen hoppas att fler ska sortera sitt avfall rätt.',
        transcriptEn:
          'The municipality informs about a new recycling station in the area. The station opens on the third of June next to the grocery store. The municipality hopes that more people will sort their waste correctly.',
        trick: 'For short answers, write only the key fact: place or reason.',
        keywords: ['bredvid matbutiken', 'sortera', 'municipality', 'next to the grocery store', 'sort'],
        listenFor: ['where', 'why'],
        questions: [
          {
            id: 'lp-8-q1',
            prompt: 'Var öppnar stationen?',
            type: 'short',
            acceptedAnswers: ['bredvid matbutiken', 'vid matbutiken'],
          },
          {
            id: 'lp-8-q2',
            prompt: 'Varför öppnar kommunen stationen?',
            type: 'short',
            acceptedAnswers: ['sortera sitt avfall rätt', 'fler ska sortera', 'sortera'],
          },
        ],
      },
      {
        id: 'lp-9',
        sv: 'föräldrakväll: skärmtid och anmälan',
        en: 'parents’ evening: screen time and registration',
        transcriptSv:
          'Föräldraföreningen ordnar en kväll om barns skärmtid. Det kostar inget att delta, men man ska anmäla sig på skolans webbplats.',
        transcriptEn:
          'The parents’ association is arranging an evening about children’s screen time. It costs nothing to take part, but you need to register on the school website.',
        trick: 'Information clips often ask topic + registration method.',
        keywords: ['skärmtid', 'anmäla sig', 'webbplats', 'screen time', 'website'],
        listenFor: ['main topic', 'how to register'],
        questions: [
          {
            id: 'lp-9-q1',
            prompt: 'Vad handlar kvällen om?',
            type: 'short',
            acceptedAnswers: ['barns skärmtid', 'skärmtid'],
          },
          {
            id: 'lp-9-q2',
            prompt: 'Hur anmäler man sig?',
            type: 'short',
            acceptedAnswers: ['på skolans webbplats', 'webbplats'],
          },
        ],
      },
      {
        id: 'lp-10',
        sv: 'hälsomässa: aktiviteter och mål',
        en: 'health fair: activities and purpose',
        transcriptSv:
          'Stadens hälsomässa ordnas i idrottshallen. Besökarna kan kontrollera blodtryck, få råd om motion och prata med en dietist. Arrangörerna vill göra det lättare att tänka på sin hälsa i vardagen.',
        transcriptEn:
          'The city’s health fair is organised in the sports hall. Visitors can check their blood pressure, get advice about exercise, and talk to a dietician. The organisers want to make it easier to think about health in everyday life.',
        trick: 'Catch two activities and one purpose. That is often enough.',
        keywords: ['blodtryck', 'motion', 'hälsa i vardagen', 'blood pressure', 'health in everyday life'],
        listenFor: ['two things people can do', 'main purpose'],
        questions: [
          {
            id: 'lp-10-q1',
            prompt: 'Vilka två saker kan besökarna göra?',
            type: 'short',
            acceptedAnswers: ['blodtryck', 'motion', 'dietist'],
          },
          {
            id: 'lp-10-q2',
            prompt: 'Varför ordnas mässan?',
            type: 'short',
            acceptedAnswers: ['hälsa i vardagen', 'tänka på sin hälsa', 'hälsa'],
          },
        ],
      },
    ] as ListeningPracticeTopic[],
  },
]

const listeningNoteTemplates = [
  {
    title: 'Quick Listening Notes',
    sign: 'W + T + P + R + A',
    text: 'Who:\nTime:\nPlace:\nReason:\nAction:\n',
  },
  {
    title: 'True/False Check',
    sign: 'Statement -> Same / Different',
    text: 'Statement:\nAudio idea:\nSame or Different:\nKeyword:\n',
  },
  {
    title: 'Short Answer Notes',
    sign: '2-4 Words Only',
    text: 'Question:\nKey word 1:\nKey word 2:\nShort answer:\n',
  },
]

const listeningMemoryRules = [
  'You are not listening for every word. You are listening for answer words.',
  'Write short notes during the first play, then verify them on the second play.',
  'A changed detail can make a true statement false.',
  'If you catch place, time, reason, and action, you often understand enough.',
]

const realExamScenarios: RealExamScenario[] = [
  {
    id: 'real-1',
    title: 'Housing Message',
    titleSv: 'Bostadsmeddelande',
    instructionSv:
      'Las fragorna forst. Du hor ett kort meddelande. Lyssna efter tid, plats och vad personen ska gora.',
    instructionEn:
      'Read the questions first. You will hear a short message. Listen for time, place, and what the person must do.',
    introSv: 'Hej, det här är ett meddelande från bostadsbolaget.',
    mainSv:
      'På torsdag klockan åtta börjar vi byta lås i huset. Arbetet tar ungefär två timmar. Du behöver vara hemma eller lämna nyckeln på kontoret senast onsdag eftermiddag.',
    transcriptSv:
      'Hej, det här är ett meddelande från bostadsbolaget. På torsdag klockan åtta börjar vi byta lås i huset. Arbetet tar ungefär två timmar. Du behöver vara hemma eller lämna nyckeln på kontoret senast onsdag eftermiddag.',
    transcriptEn:
      'Hello, this is a message from the housing company. On Thursday at eight o’clock we will start changing the locks in the building. The work takes about two hours. You need to be at home or leave the key at the office by Wednesday afternoon.',
    pauseMs: 1600,
    questions: [
      {
        id: 'real-1-q1',
        prompt: 'När börjar arbetet?',
        type: 'mcq',
        options: ['På torsdag klockan åtta', 'På onsdag eftermiddag', 'På fredag morgon'],
        correctAnswer: 'På torsdag klockan åtta',
      },
      {
        id: 'real-1-q2',
        prompt: 'Vad måste den boende göra?',
        type: 'short',
        acceptedAnswers: ['vara hemma', 'lämna nyckeln', 'nyckeln på kontoret'],
      },
    ],
  },
  {
    id: 'real-2',
    title: 'School Information',
    titleSv: 'Skolinformation',
    instructionSv:
      'Las fragorna forst. Du hor information fran skolan. Lyssna efter dag, tid och vad barnen ska ta med.',
    instructionEn:
      'Read the questions first. You will hear information from the school. Listen for day, time, and what the children should bring.',
    introSv: 'Hej! Här kommer information från skolan.',
    mainSv:
      'Klass 6 åker på utflykt nästa tisdag. Bussen går klockan nio från skolgården och eleverna kommer tillbaka halv tre. Barnen ska ha med matsäck, regnjacka och en vattenflaska.',
    transcriptSv:
      'Hej! Här kommer information från skolan. Klass 6 åker på utflykt nästa tisdag. Bussen går klockan nio från skolgården och eleverna kommer tillbaka halv tre. Barnen ska ha med matsäck, regnjacka och en vattenflaska.',
    transcriptEn:
      'Hello! Here is information from the school. Class 6 is going on a trip next Tuesday. The bus leaves at nine o’clock from the school yard and the pupils return at half past two. The children should bring a packed meal, a rain jacket, and a water bottle.',
    pauseMs: 1600,
    questions: [
      {
        id: 'real-2-q1',
        prompt: 'När går bussen?',
        type: 'mcq',
        options: ['Klockan nio', 'Halv tre', 'Nästa måndag'],
        correctAnswer: 'Klockan nio',
      },
      {
        id: 'real-2-q2',
        prompt: 'Vad ska barnen ta med?',
        type: 'short',
        acceptedAnswers: ['matsäck', 'regnjacka', 'vattenflaska'],
      },
    ],
  },
  {
    id: 'real-3',
    title: 'Health Appointment',
    titleSv: 'Vårdtid',
    instructionSv:
      'Las fragorna forst. Du hor ett meddelande fran vardcentralen. Lyssna efter varfor tiden andras och vad du ska gora.',
    instructionEn:
      'Read the questions first. You will hear a healthcare message. Listen for the reason for the change and what to do afterwards.',
    introSv: 'Hej, du har kommit till tandkliniken.',
    mainSv:
      'Din tid på fredag måste flyttas eftersom tandläkaren är sjuk. Vi erbjuder i stället måndag klockan tio eller tisdag klockan fjorton. Ring tillbaka före klockan sexton i dag.',
    transcriptSv:
      'Hej, du har kommit till tandkliniken. Din tid på fredag måste flyttas eftersom tandläkaren är sjuk. Vi erbjuder i stället måndag klockan tio eller tisdag klockan fjorton. Ring tillbaka före klockan sexton i dag.',
    transcriptEn:
      'Hello, you have reached the dental clinic. Your appointment on Friday must be moved because the dentist is ill. We instead offer Monday at ten o’clock or Tuesday at fourteen. Call back before sixteen today.',
    pauseMs: 1600,
    questions: [
      {
        id: 'real-3-q1',
        prompt: 'Varför flyttas tiden?',
        type: 'mcq',
        options: ['Tandläkaren är sjuk', 'Kliniken är stängd', 'Patienten är sen'],
        correctAnswer: 'Tandläkaren är sjuk',
      },
      {
        id: 'real-3-q2',
        prompt: 'När ska man ringa tillbaka?',
        type: 'short',
        acceptedAnswers: ['före klockan sexton', 'i dag', 'före sexton'],
      },
    ],
  },
]

const realExamFlowInfo = {
  ready: {
    label: 'Instruction',
    sv: 'Instruktion',
    description:
      'You are still reading the task. In the real exam, this is your calm moment before the audio starts.',
    translation:
      'Las fragorna forst. Leta efter vem, nar, varfor och vad personen maste gora.',
    trick: 'Do not panic. Read the questions first and predict what kind of answer you need.',
  },
  countdown: {
    label: 'Countdown',
    sv: 'Nedrakning',
    description:
      'The exam audio is about to start. Use these three seconds to look once more at the questions.',
    translation:
      'Tre, tva, ett. Titta snabbt pa fragorna och var beredd pa den forsta raden.',
    trick: 'Do one last quick scan of the questions. Be ready for the opening words.',
  },
  intro: {
    label: 'Intro',
    sv: 'Inledning',
    description:
      'The audio begins naturally. Often it starts with hej, a service opening, or a short introduction.',
    translation:
      'Nu hor du den naturliga oppningen. Svaret kommer ofta inte direkt i forsta sekunden.',
    trick: 'Listen for context only: who is speaking and what situation this is about.',
  },
  pause: {
    label: 'Pause',
    sv: 'Kort paus',
    description:
      'There is a small gap before the main information. This helps the audio feel more like a real exam.',
    translation:
      'Den har lilla pausen ger dig en chans att fokusera innan huvudinformationen kommer.',
    trick: 'Use the pause to get ready for the key facts: time, place, reason, action.',
  },
  main: {
    label: 'Main audio',
    sv: 'Huvudmeddelande',
    description:
      'Now the important details come. In many tasks, the key action or instruction is near the end.',
    translation:
      'Lyssna efter nyckelfakta. Sista meningen ar ofta mycket viktig i provet.',
    trick: 'Write short notes only. Do not try to capture every word.',
  },
  finished: {
    label: 'Finished',
    sv: 'Klart',
    description:
      'The listening has ended. Now answer the questions and only then check the transcript if needed.',
    translation:
      'Nu ska du svara pa fragorna. Visa transkriptet efterat om du vill kontrollera dig sjalv.',
    trick: 'Answer first from memory, then use the transcript only for review.',
  },
} as const

const realWritingScenarios: RealWritingScenario[] = [
  {
    id: 'rw-1',
    title: 'Housing Email',
    titleSv: 'Mejl till bostadsbolag',
    pattern: 'Practical message',
    targetWords: '80-120 words',
    instructionSv:
      'Du bor i en lagenhet. Det luktar i badrummet och vaggen blir vat efter duschen. Skriv ett mejl till bostadsbolaget. Beratta vad problemet ar, hur lange det har varit sa och be om hjalp.',
    instructionEn:
      'You live in an apartment. There is a strong smell in the bathroom and the wall is wet after showering. Write an email to the housing company. Explain the problem, how long it has lasted, and ask for help.',
    promptSv:
      'Skriv ett tydligt mejl till bostadsbolaget. Svara pa alla delar och avsluta artigt.',
    promptEn:
      'Write a clear email to the housing company. Answer every part of the task and finish politely.',
    checklist: ['Vad är problemet?', 'Hur länge har det pågått?', 'Varför är det svårt?', 'Vad vill du att de ska göra?'],
    phraseBank: phraseBank.slice(0, 4),
    starter: 'Hej,\n\nJag skriver for att ...\n\n',
    modelAnswerSv:
      'Hej,\n\nJag skriver eftersom vi har ett problem i badrummet. Det luktar starkt och väggen blir våt efter duschen. Problemet har pågått i två veckor och det blir värre varje dag.\n\nDet är svårt för oss att använda badrummet som vanligt. Kan ni skicka någon för att kontrollera problemet så snart som möjligt?\n\nVänliga hälsningar,',
    modelAnswerEn:
      'Hello,\n\nI am writing because we have a problem in the bathroom. There is a strong smell and the wall becomes wet after the shower. The problem has lasted for two weeks and it is getting worse every day.\n\nIt is difficult for us to use the bathroom normally. Could you send someone to check the problem as soon as possible?\n\nKind regards,',
  },
  {
    id: 'rw-2',
    title: 'Teacher Message',
    titleSv: 'Meddelande till larare',
    pattern: 'Practical message',
    targetWords: '80-120 words',
    instructionSv:
      'Skriv till ditt barns larare. Beratta att barnet var borta. Fraga vad barnet missade och hur barnet kan jobba ikapp.',
    instructionEn:
      'Write to your child’s teacher. Explain that your child was absent, ask what the child missed, and how the child can catch up.',
    promptSv: 'Skriv ett kort och artigt meddelande. Avsluta med en tydlig fraga.',
    promptEn: 'Write a short and polite message with a clear question at the end.',
    checklist: ['Varför var barnet borta?', 'Vilken information behöver du?', 'Hur kan barnet arbeta ikapp?'],
    phraseBank: phraseBank.slice(0, 4),
    starter: 'Hej,\n\nMitt barn ...\n\n',
    modelAnswerSv:
      'Hej,\n\nMitt barn var frånvarande i går eftersom hon var sjuk. Jag vill gärna veta vilka uppgifter hon har missat i skolan.\n\nKan ni skicka information om läxorna och berätta hur hon kan arbeta ikapp hemma? Tack för hjälpen.\n\nVänliga hälsningar,',
    modelAnswerEn:
      'Hello,\n\nMy child was absent yesterday because she was ill. I would like to know which tasks she missed at school.\n\nCould you send information about the homework and explain how she can catch up at home? Thank you for the help.\n\nKind regards,',
  },
  {
    id: 'rw-3',
    title: 'Opinion Text',
    titleSv: 'Asiktstext',
    pattern: 'Opinion text',
    targetWords: '120-170 words',
    instructionSv:
      'Skriv din asikt: ska buss och tag vara billigare? Skriv vad du tycker, ge flera skal och ett exempel.',
    instructionEn:
      'Write your opinion: should public transport be cheaper? Give a clear opinion, several reasons, and one example.',
    promptSv: 'Skriv en tydlig asiktstext med enkel struktur. Avsluta med en kort slutsats.',
    promptEn: 'Write a clear opinion text with a simple structure and finish with a conclusion.',
    checklist: ['Skriv din åsikt tidigt.', 'Ge minst tre skäl.', 'Lägg till ett exempel.', 'Avsluta tydligt.'],
    phraseBank: phraseBank.slice(3),
    starter: 'Jag tycker att ...\n\nFor det forsta ...\n\n',
    modelAnswerSv:
      'Jag tycker att kollektivtrafiken borde vara billigare. För det första hjälper det människor som har liten ekonomi. För det andra blir det lättare att resa till jobb och skola varje dag. Dessutom kan fler välja buss eller tåg i stället för bil.\n\nTill exempel behöver många arbetssökande resa ofta till intervjuer och olika möten. Om biljetterna är billigare blir det lättare för dem.\n\nDärför tycker jag att billigare kollektivtrafik är bra både för människor och för miljön.',
    modelAnswerEn:
      'I think public transport should be cheaper. First, it helps people who have little money. Second, it becomes easier to travel to work and school every day. In addition, more people can choose bus or train instead of car.\n\nFor example, many job seekers need to travel often to interviews and different meetings. If tickets are cheaper, it becomes easier for them.\n\nTherefore, I think cheaper public transport is good both for people and for the environment.',
  },
]

const realListeningPaperExams: RealListeningPaperExam[] = [
  {
    id: 'rl-paper-1',
    title: 'Prov 1',
    sections: realExamScenarios,
  },
]

const realWritingPaperExams: RealWritingPaperExam[] = [
  {
    id: 'rw-paper-1',
    title: 'Prov 1',
    tasks: [realWritingScenarios[0], realWritingScenarios[2]],
  },
  {
    id: 'rw-paper-2',
    title: 'Prov 2',
    tasks: [realWritingScenarios[1], realWritingScenarios[2]],
  },
]

const realWritingFlowInfo = {
  ready: {
    label: 'Instruction',
    sv: 'Instruktion',
    description: 'Read the task carefully and understand what kind of text you must write.',
    translation: 'Las uppgiften noggrant och hitta texttyp, mottagare och syfte.',
    trick: 'Circle the task points in your head before you start.',
  },
  plan: {
    label: 'Plan',
    sv: 'Planera',
    description: 'Make a short plan before writing. Good planning saves time and prevents confusion.',
    translation: 'Skriv bara nyckelord: struktur forst, fulla meningar senare.',
    trick: 'For email: greeting, problem, detail, ask, ending. For opinion: opinion, reasons, example, ending.',
  },
  write: {
    label: 'Write',
    sv: 'Skriv',
    description: 'Write your full answer now. Keep the language simple and answer every task point.',
    translation: 'Skriv enkla och tydliga meningar. Svara pa alla delar av uppgiften.',
    trick: 'Do not chase perfect grammar. Finish the task clearly first.',
  },
  review: {
    label: 'Review',
    sv: 'Kontrollera',
    description: 'Check your message quickly: missing detail, wrong tense, missing ending, or weak structure.',
    translation: 'Kontrollera snabbt: halsning, detaljer, tydlig fraga eller slutsats.',
    trick: 'Read only the first and last sentence first. They must be clear.',
  },
  finished: {
    label: 'Finished',
    sv: 'Klart',
    description: 'Your writing task is complete. Compare with the task points before looking at the model.',
    translation: 'Jamfor med uppgiften forst. Titta pa modellsvaret efterat.',
    trick: 'Mark what you answered well and what you missed.',
  },
} as const

const writingResourceWorkflow = [
  'Use the app writing tasks first.',
  'Then listen to one easy Swedish news clip from Yle or Radio Sweden.',
  'Write a 4-sentence summary.',
  'Rewrite the summary as a practical email or short opinion.',
  'Compare with the sample answer and improve only 2 things each time.',
]

const sixtyDayPlan = [
  {
    title: 'Days 1-10',
    focus: 'Understand the exam',
    steps: [
      'Learn the task types: short listening, practical message, opinion text.',
      'Study one housing, school, or health topic every day.',
      'Write 60-80 words daily in simple Swedish.',
    ],
  },
  {
    title: 'Days 11-20',
    focus: 'Build writing habit',
    steps: [
      'Write one practical email every day.',
      'Use greeting, problem, details, request, ending.',
      'Copy useful Swedish phrases into a notebook and reuse them.',
    ],
  },
  {
    title: 'Days 21-30',
    focus: 'Train listening + notes',
    steps: [
      'Listen to one easy Swedish clip twice only.',
      'Write who, what, where, when, why.',
      'Summarize the clip in 3-4 short sentences.',
    ],
  },
  {
    title: 'Days 31-40',
    focus: 'Opinion writing',
    steps: [
      'Write one opinion text every day.',
      'Use one opinion, three reasons, one example, one conclusion.',
      'Keep grammar simple and clear.',
    ],
  },
  {
    title: 'Days 41-50',
    focus: 'Mock exam practice',
    steps: [
      'Do 1 full mock every 2 days.',
      'Repeat only the weak sections the next day.',
      'Compare your writing with the sample answers.',
    ],
  },
  {
    title: 'Days 51-60',
    focus: 'Exam mode',
    steps: [
      'Switch to Swedish prompt first, English help only if needed.',
      'Do timed practice and stop translating every word.',
      'Focus on confidence, speed, and writing complete answers.',
    ],
  },
]

const bestPracticeLoop = [
  'Read the Swedish prompt first.',
  'Open English help only if you do not understand the task.',
  'Write your own answer in simple Swedish.',
  'Compare with the sample Swedish answer.',
  'Rewrite your answer better once.',
]

const themeTranslations: Record<string, string> = {
  'Housing and repairs': 'Boende och reparationer',
  'School and family life': 'Skola och familjeliv',
  'Health and appointments': 'Hälsa och tidsbokning',
  'Workplace and schedules': 'Arbetsplats och scheman',
  'Childcare and daily routines': 'Barnomsorg och vardagsrutiner',
  'Banking and personal finances': 'Bank och privatekonomi',
  'Public services and municipality life': 'Kommunservice och myndighetsliv',
  'Transport and travel': 'Transport och resor',
  'Neighbourhood and community': 'Grannskap och gemenskap',
  'Studies and future plans': 'Studier och framtidsplaner',
}

type WritingSupport = {
  promptSv: string
  promptEn: string
  modelAnswerSv: string
  modelAnswerEn: string
}

const getWritingSupport = (examId: string, part: 1 | 2): WritingSupport => {
  const key = `${examId}-${part}`

  const support: Record<string, WritingSupport> = {
    'exam-1-1': {
      promptSv:
        'Du bor i en lägenhet och det luktar starkt i badrummet. Det finns också fukt på väggarna. Skriv ett e-postmeddelande till bostadsbolaget. Berätta vad problemet är, hur länge det har pågått, varför det är svårt och be om hjälp med reparation.',
      promptEn:
        'You live in an apartment and there is strong smell and moisture in the bathroom. Write an email to the housing company. Describe the problem, explain how long it has lasted, say why it is difficult, and ask for repair help.',
      modelAnswerSv:
        'Hej,\n\nJag skriver för att vi har ett problem i badrummet i vår lägenhet. Det luktar starkt av fukt och väggarna känns våta efter att vi har duschat. Problemet har funnits i ungefär tre veckor.\n\nDet här är svårt för oss eftersom badrummet inte torkar ordentligt och vi är oroliga för mögel. Lukten sprider sig också till hallen.\n\nKan ni skicka någon för att kontrollera ventilationen och väggarna så snart som möjligt? Ni kan nå mig på telefon 040 123 4567.\n\nVänliga hälsningar,\nAli Hassan',
      modelAnswerEn:
        'This model answer clearly explains the smell and moisture problem, how long it has lasted, why it is difficult, and asks the housing company to inspect and repair it.',
    },
    'exam-1-2': {
      promptSv:
        'Skriv din åsikt: borde det finnas strängare tystnadsregler i höghus på kvällarna? Skriv vad du tycker och ge minst tre orsaker.',
      promptEn:
        'Write your opinion: should apartment buildings have stricter quiet rules in the evening? Give one clear opinion and three reasons.',
      modelAnswerSv:
        'Jag tycker att det borde finnas strängare tystnadsregler i höghus på kvällarna.\n\nFör det första behöver människor lugn och ro för att kunna sova bra. För det andra har många barn eller tidiga arbetstider, och högt ljud sent på kvällen gör vardagen svår. Dessutom kan bråk mellan grannar minska om reglerna är tydliga.\n\nTill exempel har vi ibland haft hög musik efter klockan tio, och då har det varit svårt att sova. Därför tycker jag att tydliga regler hjälper alla som bor i huset.\n\nSammanfattningsvis är strängare kvällsregler en bra idé.',
      modelAnswerEn:
        'This sample gives a clear opinion, three reasons, one real example, and a short conclusion.',
    },
    'exam-2-1': {
      promptSv:
        'Skriv till ditt barns lärare. Berätta att ditt barn har varit frånvarande, fråga vilka läxor barnet har och be vänligt om råd om hur barnet kan komma ikapp.',
      promptEn:
        'Write to your child’s teacher. Explain that your child was absent, ask for homework information, and politely ask how your child can catch up.',
      modelAnswerSv:
        'Hej,\n\nJag skriver eftersom min son Adam var sjuk och därför inte kunde komma till skolan i går och i dag. Jag vill gärna veta vilka läxor och uppgifter han har missat.\n\nKan ni skicka information om vad klassen har gjort? Jag vill också fråga hur Adam bäst kan komma ikapp arbetet när han kommer tillbaka.\n\nTack för hjälpen.\n\nVänliga hälsningar,\nMariam Ali',
      modelAnswerEn:
        'This answer explains the absence, asks for homework, and politely asks how the child can catch up.',
    },
    'exam-2-2': {
      promptSv:
        'Skriv din åsikt: borde skolor ge barn mindre läxor? Berätta vad du tycker och ge orsaker samt ett exempel från vardagen.',
      promptEn:
        'Write your opinion: should schools give children less homework? Give reasons and one example from daily life.',
      modelAnswerSv:
        'Jag tycker att skolor borde ge barn lite mindre läxor.\n\nFör det första behöver barn tid att vila efter skoldagen. För det andra har många barn fritidsaktiviteter och familjetid som också är viktig. Dessutom lär sig barn bättre om de inte är för trötta.\n\nTill exempel är min dotter ofta mycket trött efter skolan och orkar inte göra läxan ordentligt på kvällen. Därför tycker jag att mindre men tydligare läxor är bättre.\n\nSammanfattningsvis borde skolor tänka mer på barnens ork.',
      modelAnswerEn:
        'This model answer gives one clear opinion, several reasons, a daily-life example, and a conclusion.',
    },
    'exam-3-1': {
      promptSv:
        'Skriv till hälsocentralen. Berätta att du måste avboka en tid, ge en orsak och fråga om en ny tid.',
      promptEn:
        'Write to the health centre. Explain that you need to cancel an appointment, give a reason, and ask for a new appointment time.',
      modelAnswerSv:
        'Hej,\n\nJag måste tyvärr avboka min läkartid på torsdag eftersom jag måste resa till en annan stad för ett viktigt familjeärende.\n\nJag vill gärna boka en ny tid så snart som möjligt. Om det finns lediga tider nästa vecka passar eftermiddagar bäst för mig.\n\nTack för hjälpen.\n\nVänliga hälsningar,\nOmar Rahman',
      modelAnswerEn:
        'This message cancels the appointment, gives a reason, and asks for a new time in a polite way.',
    },
    'exam-3-2': {
      promptSv:
        'Skriv din åsikt: borde arbetsplatser stödja motion för anställda mer aktivt? Förklara varför.',
      promptEn:
        'Write your opinion: should workplaces support employee exercise more actively? Explain why.',
      modelAnswerSv:
        'Jag tycker att arbetsplatser borde stödja motion för anställda mer aktivt.\n\nFör det första förbättrar motion hälsan. För det andra orkar personalen bättre och kan arbeta mer effektivt. Dessutom kan gemensamma motionsaktiviteter skapa bättre stämning på jobbet.\n\nTill exempel kunde arbetsplatsen erbjuda rabatt på gym eller en kort promenadgrupp efter arbetet. Därför tycker jag att stöd till motion är bra både för arbetstagare och arbetsgivare.\n\nSammanfattningsvis är mer stöd till motion en smart idé.',
      modelAnswerEn:
        'This answer connects exercise to health, work performance, and workplace atmosphere.',
    },
    'exam-4-1': {
      promptSv:
        'Skriv ett e-postmeddelande till din chef. Berätta att du behöver byta ett arbetsskift, ge en orsak och föreslå en lösning.',
      promptEn:
        'Write an email to your manager. Explain that you need to swap one work shift, give a reason, and suggest a solution.',
      modelAnswerSv:
        'Hej,\n\nJag skriver eftersom jag behöver byta mitt kvällsskift på fredag. Min son har ett viktigt läkarbesök samma eftermiddag och jag måste följa med honom.\n\nJag har redan frågat min kollega Ahmed, och han kan ta mitt kvällsskift om jag arbetar hans morgonskift på måndag i stället. Passar den här lösningen?\n\nTack på förhand.\n\nVänliga hälsningar,\nSara Khan',
      modelAnswerEn:
        'This email clearly states the reason for the shift change and offers a practical solution.',
    },
    'exam-4-2': {
      promptSv:
        'Skriv din åsikt: är erfarenhet av kundservice viktigare än formell utbildning i vissa jobb? Ge orsaker.',
      promptEn:
        'Write your opinion: is customer service experience more important than formal education in some jobs? Give reasons.',
      modelAnswerSv:
        'Jag tycker att erfarenhet av kundservice kan vara viktigare än formell utbildning i vissa jobb.\n\nFör det första lär man sig mycket genom praktiskt arbete med kunder. För det andra är kommunikation och tålamod mycket viktigt i serviceyrken. Dessutom kan en person med erfarenhet ofta lösa problem snabbare.\n\nTill exempel i butik eller restaurang behöver man kunna prata lugnt med kunder och hjälpa dem direkt. Därför tycker jag att erfarenhet ibland väger mer än utbildning.\n\nSammanfattningsvis beror det på jobbet, men kundserviceerfarenhet är ofta mycket värdefull.',
      modelAnswerEn:
        'This answer balances the argument and explains why practical experience matters in service jobs.',
    },
    'exam-5-1': {
      promptSv:
        'Skriv till ditt barns daghem. Berätta att en annan vuxen ska hämta barnet, skriv personens namn och relation till barnet och fråga vilken information daghemmet behöver.',
      promptEn:
        'Write to your child’s daycare. Explain that another adult will pick up your child, give the person’s name and relation, and ask what information the daycare needs.',
      modelAnswerSv:
        'Hej,\n\nJag vill meddela att min syster Lina Ahmed ska hämta min dotter Aya från daghemmet i morgon eftermiddag. Lina är Ayas moster och känner barnet bra.\n\nJag vill gärna fråga om ni behöver någon extra information eller identifikation när hon kommer. Ni kan ringa mig om ni har frågor.\n\nTack för hjälpen.\n\nVänliga hälsningar,\nNadia Ahmed',
      modelAnswerEn:
        'This model clearly tells who will pick up the child, the relationship, and asks what the daycare needs.',
    },
    'exam-5-2': {
      promptSv:
        'Skriv din åsikt: borde föräldrar minska barns skärmtid mer aktivt? Ge orsaker.',
      promptEn:
        'Write your opinion: should parents reduce children’s screen time more actively? Give reasons.',
      modelAnswerSv:
        'Jag tycker att föräldrar borde minska barns skärmtid mer aktivt.\n\nFör det första behöver barn röra sig och leka mer. För det andra kan för mycket skärmtid påverka sömn och koncentration. Dessutom får barn mer tid för familj och vänner om skärmtiden är kortare.\n\nTill exempel somnar barn ofta senare om de använder telefon eller surfplatta på kvällen. Därför tycker jag att tydliga regler hemma är viktiga.\n\nSammanfattningsvis är mindre skärmtid bättre för barnens hälsa och vardag.',
      modelAnswerEn:
        'This sample connects screen time to movement, sleep, concentration, and family life.',
    },
    'exam-6-1': {
      promptSv:
        'Skriv till din bank. Berätta att en betalning inte har gått igenom, beskriv vad som hände och be om hjälp.',
      promptEn:
        'Write to your bank. Explain that a payment has not gone through, describe what happened, and ask for help.',
      modelAnswerSv:
        'Hej,\n\nJag försökte betala min hyra via nätbanken i går kväll, men betalningen gick inte igenom. Pengarna drogs inte från kontot och jag fick ett felmeddelande på skärmen.\n\nJag är orolig eftersom hyran måste betalas i tid. Kan ni kontrollera vad problemet är och ge mig råd om vad jag ska göra nu?\n\nVänliga hälsningar,\nHasan Noor',
      modelAnswerEn:
        'This message describes the failed payment, the error, the urgency, and asks the bank for support.',
    },
    'exam-6-2': {
      promptSv:
        'Skriv din åsikt: borde skolor undervisa mer om privatekonomi? Ge orsaker.',
      promptEn:
        'Write your opinion: should schools teach more about personal finances? Give reasons.',
      modelAnswerSv:
        'Jag tycker att skolor borde undervisa mer om privatekonomi.\n\nFör det första behöver unga förstå hur man gör en budget. För det andra är det viktigt att veta hur räkningar, lån och abonnemang fungerar. Dessutom kan bättre kunskap minska ekonomiska problem senare i livet.\n\nTill exempel flyttar många unga hemifrån utan att riktigt förstå sina månadskostnader. Därför tycker jag att ekonomi borde vara en tydligare del av skolan.\n\nSammanfattningsvis hjälper kunskap om pengar unga att fatta bättre beslut.',
      modelAnswerEn:
        'This model explains why financial knowledge is practical and important for young people.',
    },
    'exam-7-1': {
      promptSv:
        'Skriv till kommunen. Berätta att du vill delta i en kurs i svenska, fråga om nivå, schema och anmälan.',
      promptEn:
        'Write to the municipality. Explain that you want to join a Swedish course, ask about level, schedule, and registration.',
      modelAnswerSv:
        'Hej,\n\nJag är intresserad av att delta i en kurs i svenska för vuxna. Jag har studerat lite svenska tidigare men är fortfarande nybörjare.\n\nJag vill gärna veta vilken nivå kursen har, vilka dagar och tider den ordnas och hur man anmäler sig. Jag vill också fråga om kursen kostar något.\n\nTack för informationen.\n\nVänliga hälsningar,\nFarid Ali',
      modelAnswerEn:
        'This email asks about level, timetable, registration, and course cost in a clear way.',
    },
    'exam-7-2': {
      promptSv:
        'Skriv din åsikt: borde kommuner erbjuda fler billiga språkkurser för vuxna? Förklara varför.',
      promptEn:
        'Write your opinion: should municipalities offer more low-cost language courses for adults? Explain why.',
      modelAnswerSv:
        'Jag tycker att kommuner borde erbjuda fler billiga språkkurser för vuxna.\n\nFör det första hjälper språket människor i arbete och vardag. För det andra blir det lättare att använda myndigheter, vård och skola om man kan svenska bättre. Dessutom får människor mer självförtroende när de vågar tala.\n\nTill exempel kan en billig kvällskurs hjälpa personer som arbetar på dagarna. Därför tycker jag att fler billiga kurser är en viktig investering.\n\nSammanfattningsvis är språkkurser bra både för individen och samhället.',
      modelAnswerEn:
        'This answer shows how low-cost courses help with work, services, and confidence.',
    },
    'exam-8-1': {
      promptSv:
        'Skriv till ett transportbolag. Berätta att ditt månadskort inte fungerade, beskriv situationen och be om en lösning.',
      promptEn:
        'Write to a transport company. Explain that your monthly card did not work, describe the situation, and ask for a solution.',
      modelAnswerSv:
        'Hej,\n\nJag vill meddela att mitt månadskort inte fungerade på bussen i morse. När jag försökte använda kortet visade apparaten ett felmeddelande, trots att kortet är giltigt till slutet av månaden.\n\nDet här skapade problem eftersom jag var på väg till jobbet och blev försenad. Kan ni kontrollera varför kortet inte fungerade och berätta hur jag kan få problemet löst?\n\nVänliga hälsningar,\nMina Yusuf',
      modelAnswerEn:
        'This answer explains the card problem, the consequence, and asks the company to fix it.',
    },
    'exam-8-2': {
      promptSv:
        'Skriv din åsikt: borde kollektivtrafiken vara billigare för nya invånare och arbetssökande? Ge orsaker.',
      promptEn:
        'Write your opinion: should public transport be cheaper for new residents and job seekers? Give reasons.',
      modelAnswerSv:
        'Jag tycker att kollektivtrafiken borde vara billigare för nya invånare och arbetssökande.\n\nFör det första behöver dessa grupper ofta resa mycket till myndigheter, kurser och arbetsintervjuer. För det andra har många begränsad ekonomi i början. Dessutom gör billigare resor det lättare att delta i samhället.\n\nTill exempel kan en person som söker jobb behöva åka till flera intervjuer på kort tid. Därför tycker jag att billigare biljetter är en bra idé.\n\nSammanfattningsvis hjälper billig kollektivtrafik människor att komma vidare snabbare.',
      modelAnswerEn:
        'This model connects transport cost to access, job search, and integration.',
    },
    'exam-9-1': {
      promptSv:
        'Skriv till din granne eller hyresvärd om upprepat kvällsbuller. Beskriv problemet artigt och be om en lösning.',
      promptEn:
        'Write to your neighbour or housing manager about repeated evening noise. Explain the problem politely and ask for a solution.',
      modelAnswerSv:
        'Hej,\n\nJag vill vänligt ta upp ett problem med högt ljud på kvällarna. Under den senaste veckan har det ofta varit hög musik efter klockan tio från lägenheten bredvid.\n\nDet här är svårt för min familj eftersom vi har barn som behöver sova tidigt och jag själv börjar arbeta tidigt på morgonen. Jag hoppas att vi kan hitta en lugn lösning på problemet.\n\nTack för förståelsen.\n\nVänliga hälsningar,\nAsha Rahman',
      modelAnswerEn:
        'This message is polite, explains the repeated noise, says why it is difficult, and asks for a solution.',
    },
    'exam-9-2': {
      promptSv:
        'Skriv din åsikt: borde grannar känna varandra bättre i höghus? Förklara varför.',
      promptEn:
        'Write your opinion: should neighbours know each other better in apartment buildings? Explain why.',
      modelAnswerSv:
        'Jag tycker att grannar borde känna varandra bättre i höghus.\n\nFör det första känns det tryggare när man känner människorna omkring sig. För det andra blir det lättare att be om hjälp i små vardagliga situationer. Dessutom kan många problem lösas snabbare om människor vågar prata direkt med varandra.\n\nTill exempel kan en granne hjälpa till att ta emot ett paket eller ge information om huset. Därför tycker jag att bättre kontakt mellan grannar är positivt.\n\nSammanfattningsvis skapar goda grannrelationer ett bättre boende för alla.',
      modelAnswerEn:
        'This answer shows how neighbour relationships improve safety, support, and communication.',
    },
    'exam-10-1': {
      promptSv:
        'Skriv till en studievägledare. Berätta vad du vill studera, vilken bakgrund du har och fråga vilken nivå i svenska som behövs.',
      promptEn:
        'Write to a study advisor. Explain what you want to study, say what background you have, and ask what level of Swedish is needed.',
      modelAnswerSv:
        'Hej,\n\nJag är intresserad av att studera logistik nästa höst. Jag har tidigare arbetat i lager i två år och jag vill nu utveckla mina kunskaper genom utbildning.\n\nJag vill gärna veta vilken nivå i svenska som krävs för utbildningen. Jag vill också fråga om det finns förberedande kurser för personer som fortfarande lär sig svenska.\n\nTack för informationen.\n\nVänliga hälsningar,\nBilal Ahmed',
      modelAnswerEn:
        'This email explains study interest, background, and asks about the Swedish level needed.',
    },
    'exam-10-2': {
      promptSv:
        'Skriv din åsikt: är det bättre att studera och arbeta samtidigt, eller att fokusera på en sak först? Ge orsaker.',
      promptEn:
        'Write your opinion: is it better to study and work at the same time, or focus on one thing first? Give reasons.',
      modelAnswerSv:
        'Jag tycker att det ofta är bättre att studera och arbeta samtidigt, om det är möjligt.\n\nFör det första får man både teori och praktisk erfarenhet. För det andra kan man fortsätta tjäna pengar under studietiden. Dessutom hjälper arbete ofta människor att använda språket i vardagen.\n\nTill exempel kan deltidsarbete ge viktig erfarenhet som också hjälper i studierna. Samtidigt måste man planera tiden bra. Därför tycker jag att kombinationen kan vara bra för många.\n\nSammanfattningsvis är det en bra lösning om man orkar och har en tydlig plan.',
      modelAnswerEn:
        'This model answer gives a balanced opinion and explains the benefits of studying and working at the same time.',
    },
  }

  return support[key]
}

const getModelAnswerTranslation = (examId: string, part: 1 | 2) => {
  const key = `${examId}-${part}`

  const translations: Record<string, string> = {
    'exam-1-1':
      'Hello,\n\nI am writing because we have a problem in the bathroom in our apartment. There is a strong smell of moisture, and the walls feel wet after we shower. The problem has lasted for about three weeks.\n\nThis is difficult for us because the bathroom does not dry properly and we are worried about mould. The smell also spreads to the hallway.\n\nCould you send someone to check the ventilation and the walls as soon as possible? You can reach me by phone at 040 123 4567.\n\nKind regards,\nAli Hassan',
    'exam-1-2':
      'I think there should be stricter quiet rules in apartment buildings in the evenings.\n\nFirst, people need peace and quiet in order to sleep well. Second, many people have children or early working hours, and loud noise late in the evening makes everyday life difficult. In addition, conflicts between neighbours can decrease if the rules are clear.\n\nFor example, we have sometimes had loud music after ten o’clock, and then it has been difficult to sleep. Therefore, I think clear rules help everyone who lives in the building.\n\nIn conclusion, stricter evening rules are a good idea.',
    'exam-2-1':
      'Hello,\n\nI am writing because my son Adam was ill and therefore could not come to school yesterday and today. I would like to know which homework and tasks he has missed.\n\nCould you send information about what the class has done? I would also like to ask how Adam can best catch up with the work when he comes back.\n\nThank you for your help.\n\nKind regards,\nMariam Ali',
    'exam-2-2':
      'I think schools should give children a little less homework.\n\nFirst, children need time to rest after the school day. Second, many children also have hobbies and family time, which are important. In addition, children learn better when they are not too tired.\n\nFor example, my daughter is often very tired after school and cannot do her homework properly in the evening. Therefore, I think less but clearer homework is better.\n\nIn conclusion, schools should think more about children’s energy.',
    'exam-3-1':
      'Hello,\n\nUnfortunately, I need to cancel my doctor’s appointment on Thursday because I have to travel to another city for an important family matter.\n\nI would like to book a new appointment as soon as possible. If there are free times next week, afternoons suit me best.\n\nThank you for your help.\n\nKind regards,\nOmar Rahman',
    'exam-3-2':
      'I think workplaces should support employee exercise more actively.\n\nFirst, exercise improves health. Second, staff have more energy and can work more effectively. In addition, shared exercise activities can create a better atmosphere at work.\n\nFor example, the workplace could offer a gym discount or a short walking group after work. Therefore, I think support for exercise is good for both employees and employers.\n\nIn conclusion, more support for exercise is a smart idea.',
    'exam-4-1':
      'Hello,\n\nI am writing because I need to change my evening shift on Friday. My son has an important doctor’s appointment that afternoon, and I must go with him.\n\nI have already asked my colleague Ahmed, and he can take my evening shift if I work his morning shift on Monday instead. Would this solution be suitable?\n\nThank you in advance.\n\nKind regards,\nSara Khan',
    'exam-4-2':
      'I think customer service experience can be more important than formal education in some jobs.\n\nFirst, you learn a lot through practical work with customers. Second, communication and patience are very important in service jobs. In addition, a person with experience can often solve problems faster.\n\nFor example, in a shop or restaurant you need to be able to speak calmly with customers and help them directly. Therefore, I think experience sometimes matters more than education.\n\nIn conclusion, it depends on the job, but customer service experience is often very valuable.',
    'exam-5-1':
      'Hello,\n\nI would like to inform you that my sister Lina Ahmed will pick up my daughter Aya from daycare tomorrow afternoon. Lina is Aya’s aunt and knows the child well.\n\nI would like to ask whether you need any extra information or identification when she comes. You can call me if you have any questions.\n\nThank you for your help.\n\nKind regards,\nNadia Ahmed',
    'exam-5-2':
      'I think parents should reduce children’s screen time more actively.\n\nFirst, children need to move and play more. Second, too much screen time can affect sleep and concentration. In addition, children have more time for family and friends if screen time is shorter.\n\nFor example, children often fall asleep later if they use a phone or tablet in the evening. Therefore, I think clear rules at home are important.\n\nIn conclusion, less screen time is better for children’s health and everyday life.',
    'exam-6-1':
      'Hello,\n\nI tried to pay my rent through online banking yesterday evening, but the payment did not go through. The money was not taken from my account and I got an error message on the screen.\n\nI am worried because the rent must be paid on time. Could you check what the problem is and advise me on what I should do now?\n\nKind regards,\nHasan Noor',
    'exam-6-2':
      'I think schools should teach more about personal finances.\n\nFirst, young people need to understand how to make a budget. Second, it is important to know how bills, loans, and subscriptions work. In addition, better knowledge can reduce financial problems later in life.\n\nFor example, many young people move out without really understanding their monthly costs. Therefore, I think finances should be a clearer part of school.\n\nIn conclusion, knowledge about money helps young people make better decisions.',
    'exam-7-1':
      'Hello,\n\nI am interested in joining a Swedish course for adults. I have studied some Swedish before but I am still a beginner.\n\nI would like to know what level the course is, on which days and at what times it is organised, and how to register. I would also like to ask whether the course costs anything.\n\nThank you for the information.\n\nKind regards,\nFarid Ali',
    'exam-7-2':
      'I think municipalities should offer more low-cost language courses for adults.\n\nFirst, language helps people in work and everyday life. Second, it becomes easier to use authorities, healthcare, and school if you know Swedish better. In addition, people get more self-confidence when they dare to speak.\n\nFor example, a cheap evening course can help people who work during the day. Therefore, I think more low-cost courses are an important investment.\n\nIn conclusion, language courses are good for both the individual and society.',
    'exam-8-1':
      'Hello,\n\nI would like to inform you that my monthly card did not work on the bus this morning. When I tried to use the card, the machine showed an error message, even though the card is valid until the end of the month.\n\nThis caused problems because I was on my way to work and became late. Could you check why the card did not work and tell me how I can get the problem solved?\n\nKind regards,\nMina Yusuf',
    'exam-8-2':
      'I think public transport should be cheaper for new residents and job seekers.\n\nFirst, these groups often need to travel a lot to authorities, courses, and job interviews. Second, many people have limited finances at the beginning. In addition, cheaper travel makes it easier to take part in society.\n\nFor example, a person looking for work may need to travel to several interviews in a short time. Therefore, I think cheaper tickets are a good idea.\n\nIn conclusion, cheap public transport helps people move forward faster.',
    'exam-9-1':
      'Hello,\n\nI would like to politely raise a problem with loud noise in the evenings. During the past week there has often been loud music after ten o’clock from the apartment next door.\n\nThis is difficult for my family because we have children who need to sleep early and I myself start work early in the morning. I hope we can find a calm solution to the problem.\n\nThank you for your understanding.\n\nKind regards,\nAsha Rahman',
    'exam-9-2':
      'I think neighbours should know each other better in apartment buildings.\n\nFirst, it feels safer when you know the people around you. Second, it becomes easier to ask for help in small everyday situations. In addition, many problems can be solved faster if people dare to speak directly with each other.\n\nFor example, a neighbour can help receive a package or give information about the building. Therefore, I think better contact between neighbours is positive.\n\nIn conclusion, good neighbour relationships create a better living environment for everyone.',
    'exam-10-1':
      'Hello,\n\nI am interested in studying logistics next autumn. I have previously worked in a warehouse for two years and I now want to develop my knowledge through education.\n\nI would like to know what level of Swedish is required for the programme. I would also like to ask whether there are preparatory courses for people who are still learning Swedish.\n\nThank you for the information.\n\nKind regards,\nBilal Ahmed',
    'exam-10-2':
      'I think it is often better to study and work at the same time, if possible.\n\nFirst, you get both theory and practical experience. Second, you can continue earning money during your studies. In addition, work often helps people use the language in everyday life.\n\nFor example, part-time work can give important experience that also helps in studies. At the same time, you must plan your time well. Therefore, I think the combination can be good for many people.\n\nIn conclusion, it is a good solution if you have enough energy and a clear plan.',
  }

  return translations[key] ?? 'English translation is not available yet for this sample answer.'
}

const englishTextMap: Record<string, string> = {
  'När börjar arbetet?': 'When does the work start?',
  'Vad måste den boende göra?': 'What must the resident do?',
  'På onsdag eftermiddag': 'On Wednesday afternoon',
  'På torsdag klockan åtta': 'On Thursday at eight o’clock',
  'På fredag klockan två': 'On Friday at two o’clock',
  'Köpa ett nytt lås': 'Buy a new lock',
  'Vara hemma eller lämna nyckeln': 'Be at home or leave the key',
  'Ringa polisen': 'Call the police',
  'Mikael tycker att bokningssystemet är enkelt.': 'Mikael thinks the booking system is easy.',
  'Grannen vill köpa två nya maskiner.': 'The neighbour wants to buy two new machines.',
  'Var öppnar den nya återvinningsstationen?': 'Where does the new recycling station open?',
  'Varför öppnar kommunen stationen?': 'Why is the municipality opening the station?',
  'När går bussen?': 'When does the bus leave?',
  'Vad ska barnen ta med?': 'What should the children bring?',
  'Klockan nio': 'At nine o’clock',
  'Halv tre': 'Half past two',
  'Nästa måndag': 'Next Monday',
  'Pass och pengar': 'Passport and money',
  'Matsäck, regnjacka och vattenflaska': 'Packed meal, rain jacket, and water bottle',
  'Bara skolböcker': 'Only school books',
  'Sonen vill göra läxan direkt när han kommer hem.': 'The son wants to do homework as soon as he gets home.',
  'De hittar en kompromiss.': 'They find a compromise.',
  'Vad handlar kvällen om?': 'What is the evening about?',
  'Hur anmäler man sig?': 'How do you register?',
  'Varför flyttas tiden?': 'Why is the appointment moved?',
  'När ska man ringa tillbaka?': 'When should you call back?',
  'Kliniken är stängd för renovering': 'The clinic is closed for renovation',
  'Tandläkaren är sjuk': 'The dentist is ill',
  'Patienten har avbokat': 'The patient has cancelled',
  'Före klockan sexton i dag': 'Before 16:00 today',
  'Nästa vecka': 'Next week',
  'Efter klockan sexton': 'After 16:00',
  'Jonas har redan bokat en tid på hälsocentralen.': 'Jonas has already booked an appointment at the health centre.',
  'Hans vän tycker att han ska vila.': 'His friend thinks he should rest.',
  'Vilka två saker kan besökarna göra på mässan?': 'What two things can visitors do at the fair?',
  'Varför ordnas mässan?': 'Why is the fair organized?',
  'Vad ändras i morgon?': 'What changes tomorrow?',
  'När ska man meddela chefen?': 'When should you inform the manager?',
  'Lönen': 'The salary',
  'Kvällsskiftets starttid': 'The evening shift start time',
  'Semesterlistan': 'The holiday list',
  'Före lunch': 'Before lunch',
  'Efter jobbet': 'After work',
  'Leo tycker att Amina ska skriva mindre om sina erfarenheter.': 'Leo thinks Amina should write less about her experience.',
  'Amina vill öva inför intervju.': 'Amina wants to practise for an interview.',
  'Vad lär sig deltagarna på kursen?': 'What do participants learn in the course?',
  'Varför ska man anmäla sig snabbt?': 'Why should you register quickly?',
  'Varför ska barnen vara ute längre?': 'Why should the children stay outside longer?',
  'Vad ska föräldrarna göra om barnet behöver medicin?': 'What should parents do if the child needs medicine?',
  'Det blir fint väder': 'The weather will be nice',
  'Det finns inget rum inne': 'There is no room inside',
  'De ska resa bort': 'They are going away',
  'Stanna hemma': 'Stay at home',
  'Ge tydliga instruktioner': 'Give clear instructions',
  'Köpa ny medicin': 'Buy new medicine',
  'Partnern kan lätt hämta barnet varje eftermiddag.': 'The partner can easily pick up the child every afternoon.',
  'Morfar hjälper till på fredagar.': 'Grandfather helps on Fridays.',
  'Vad händer efter sagostunden?': 'What happens after the story time?',
  'Varför ska man komma i god tid?': 'Why should you come early?',
  'När sker förändringen?': 'When does the change happen?',
  'Hur kan kunder boka personlig service?': 'How can customers book personal service?',
  'Från och med nästa månad': 'Starting next month',
  'I morgon': 'Tomorrow',
  'Nästa år': 'Next year',
  'Via appen eller telefon': 'Via the app or by phone',
  'Bara via e-post': 'Only by email',
  'Bara på lördagar': 'Only on Saturdays',
  'Elin har redan full kontroll över sina små utgifter.': 'Elin already has full control over her small expenses.',
  'Hon vill spara pengar till en resa.': 'She wants to save money for a trip.',
  'Vilka problem hjälper rådgivarna särskilt till med?': 'Which problems do the advisers especially help with?',
  'Vad är målet med tjänsten?': 'What is the goal of the service?',
  'Varför stängs simhallen?': 'Why is the swimming hall closed?',
  'Vad gäller under stängningen?': 'What applies during the closure?',
  'På grund av tävling': 'Because of a competition',
  'För årligt underhåll': 'For annual maintenance',
  'För att det är helg': 'Because it is the weekend',
  'Medlemskortet fungerar i grannkommunens simhall': 'The membership card works in the neighbouring municipality’s swimming hall',
  'Man får pengarna tillbaka': 'You get your money back',
  'Simhallen öppnar bara på kvällar': 'The swimming hall opens only in the evenings',
  'Grupprummet kostar pengar.': 'The group room costs money.',
  'Rami hade missförstått vem som får använda rummet.': 'Rami had misunderstood who may use the room.',
  'Vilka färdigheter tränar deltagarna?': 'Which skills do participants practise?',
  'Vilken grupp blir ofta full först?': 'Which group usually fills up first?',
  'Hur lång är förseningen?': 'How long is the delay?',
  'Vad kan resenärer göra?': 'What can passengers do?',
  'Tio minuter': 'Ten minutes',
  'Trettiо minuter': 'Thirty minutes',
  'En timme': 'One hour',
  'Byta till buss utan extra kostnad': 'Switch to a bus at no extra cost',
  'Åka hem gratis taxi': 'Go home by free taxi',
  'Hämta pengar i kiosken': 'Collect money in the kiosk',
  'Sofia tar redan alltid bussen till jobbet.': 'Sofia already always takes the bus to work.',
  'Bussen kan vara full på morgonen.': 'The bus can be full in the morning.',
  'Var börjar stadsvandringen?': 'Where does the city walk start?',
  'Varför deltar många i vandringen?': 'Why do many people take part in the walk?',
  'När ordnas städdagen?': 'When is the cleaning day organized?',
  'Vad händer efter arbetet?': 'What happens after the work?',
  'På fredag kväll': 'On Friday evening',
  'På lördag mellan tio och tretton': 'On Saturday between ten and one',
  'På söndag morgon': 'On Sunday morning',
  'Alla går hem direkt': 'Everyone goes straight home',
  'Det blir kaffe och smörgås': 'There will be coffee and sandwiches',
  'Det blir ett möte med polisen': 'There will be a meeting with the police',
  'Båda grannarna vill använda exakt samma lösning.': 'Both neighbours want to use exactly the same solution.',
  'De tycker båda att situationen behöver lösas.': 'They both think the situation needs to be solved.',
  'Vem söker projektet?': 'Who is the project looking for?',
  'Vad hoppas arrangörerna på?': 'What do the organizers hope for?',
  'När slutar ansökningstiden?': 'When does the application period end?',
  'Vad ska man ta med till mötet?': 'What should you bring to the meeting?',
  'Den femtonde maj': 'The fifteenth of May',
  'Varje torsdag': 'Every Thursday',
  'Till hösten': 'By autumn',
  'En dator och lunch': 'A computer and lunch',
  'Tidigare betyg och identitetshandling': 'Previous certificates and identity document',
  'Bara ett cv': 'Only a CV',
  'Bilals syster tycker att han ska säga upp sig direkt.': 'Bilal’s sister thinks he should resign immediately.',
  'Bilal tänker på både ekonomi och ork.': 'Bilal is thinking about both money and energy.',
  'Hur länge varar praktiken?': 'How long does the internship last?',
  'Vad kan hända efter praktiken?': 'What can happen after the internship?',
  True: 'True',
  False: 'False',
}

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const splitAnswerLines = (text: string) =>
  text
    .split(/\n+/)
    .flatMap((part) => part.split(/(?<=[.!?])\s+/))
    .map((item) => item.trim())
    .filter(Boolean)

const highlightText = (text: string, keywords: string[]) => {
  if (keywords.length === 0) {
    return text
  }

  const escapedKeywords = keywords
    .filter(Boolean)
    .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escapedKeywords.join('|')})`, 'giu')
  const parts = text.split(pattern)

  return parts.map((part, index) => {
    const isKeyword = keywords.some((keyword) => part.toLowerCase() === keyword.toLowerCase())
    return isKeyword ? (
      <mark key={`${part}-${index}`} className="keyword-mark">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  })
}

const translateToEnglish = (value: string) => englishTextMap[value] ?? value

const getEnglishHelpText = (exam: MockExam, section: ListeningSection | WritingSection) => {
  if (section.kind === 'listening') {
    const translatedTheme = translateToEnglish(exam.theme)
    if (section.pattern === 'Short message and multiple choice') {
      return `English help: This audio is about ${translatedTheme.toLowerCase()}. Listen for time, place, and what action the person must take.`
    }
    if (section.pattern === 'Conversation and true/false') {
      return `English help: This conversation is about ${translatedTheme.toLowerCase()}. Listen for opinions, problems, and what each person wants.`
    }
    return `English help: This information clip is about ${translatedTheme.toLowerCase()}. Listen for key facts such as where, when, and why.`
  }

  return 'English help: Read the task carefully, answer every point, and use short, clear Swedish sentences.'
}

const buildExams = (): MockExam[] =>
  examBlueprints.map((blueprint) => {
    const writingOneSupport = getWritingSupport(blueprint.id, 1)
    const writingTwoSupport = getWritingSupport(blueprint.id, 2)

    return {
      id: blueprint.id,
      title: blueprint.title,
      theme: blueprint.theme,
      durationMinutes: 50,
      commonInHall: [
        'short message with time and action',
        'conversation with opinion and problem',
        'information clip with practical facts',
        'practical writing task',
        'opinion writing task',
      ],
      hallNotes: [
        'This simulator uses realistic YKI-style task patterns, not leaked exam questions.',
        'Listening sections are limited to two plays, like official intermediate listening practice.',
        'Focus on names, times, places, reason, and action.',
      ],
      vocabulary: blueprint.vocabulary,
      listeningSections: [
        {
          id: `${blueprint.id}-listening-1`,
          kind: 'listening',
          title: 'Listening Part 1',
          pattern: 'Short message and multiple choice',
          instruction: 'Listen to the message. Choose the best answer.',
          audioText: blueprint.shortAudio,
          questions: blueprint.shortQuestions,
        },
        {
          id: `${blueprint.id}-listening-2`,
          kind: 'listening',
          title: 'Listening Part 2',
          pattern: 'Conversation and true/false',
          instruction: 'Listen to the conversation. Mark each statement true or false.',
          audioText: blueprint.tfAudio,
          questions: blueprint.tfQuestions.map((question) => ({
            ...question,
            options: ['True', 'False'],
          })),
        },
        {
          id: `${blueprint.id}-listening-3`,
          kind: 'listening',
          title: 'Listening Part 3',
          pattern: 'Information clip and short answers',
          instruction: 'Listen to the information clip. Write short answers in English or simple Swedish.',
          audioText: blueprint.openAudio,
          questions: blueprint.openQuestions,
        },
      ],
      writingSections: [
        {
          id: `${blueprint.id}-writing-1`,
          kind: 'writing',
          title: 'Writing Part 1',
          pattern: 'Practical message',
          targetWords: '80-120 words',
          instruction: 'Write a clear message. Answer all task points.',
          prompt: writingOneSupport.promptSv,
          promptEnglish: writingOneSupport.promptEn,
          modelAnswerSwedish: writingOneSupport.modelAnswerSv,
          modelAnswerTranslationEnglish: getModelAnswerTranslation(blueprint.id, 1),
          modelAnswerEnglish: writingOneSupport.modelAnswerEn,
          checklist: [
            'Use greeting and ending.',
            'Explain the situation clearly.',
            'Include at least two details.',
            'Ask for action or information.',
            'Keep the language simple and correct.',
          ],
          phraseBank: phraseBank.slice(0, 4),
          starter: 'Hej,\n\nJag skriver för att ...\n\n',
        },
        {
          id: `${blueprint.id}-writing-2`,
          kind: 'writing',
          title: 'Writing Part 2',
          pattern: 'Opinion text',
          targetWords: '120-170 words',
          instruction: 'Write one clear opinion and support it with reasons and one example.',
          prompt: writingTwoSupport.promptSv,
          promptEnglish: writingTwoSupport.promptEn,
          modelAnswerSwedish: writingTwoSupport.modelAnswerSv,
          modelAnswerTranslationEnglish: getModelAnswerTranslation(blueprint.id, 2),
          modelAnswerEnglish: writingTwoSupport.modelAnswerEn,
          checklist: [
            'State your opinion early.',
            'Give at least three reasons.',
            'Use connectors like för det första, dessutom, därför.',
            'Add one real example.',
            'Finish with a short conclusion.',
          ],
          phraseBank: phraseBank.slice(3),
          starter: 'Jag tycker att ...\n\nFör det första ...\n\n',
        },
      ],
    }
  })

const mockExams = buildExams()

function App() {
  const getTodayIsoDate = () => new Date().toISOString().slice(0, 10)
  const appShellRef = useRef<HTMLDivElement | null>(null)
  const [activeTab, setActiveTab] = useState<MainTab>('realExamScenario')
  const [selectedExamId, setSelectedExamId] = useState(mockExams[0].id)
  const [examStarted, setExamStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({})
  const [, setShowTranscript] = useState(false)
  const [showEnglishHelp] = useState(true)
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)
  const [selectedTopicTerm, setSelectedTopicTerm] = useState<{
    source: string
    translation: string
    lang: 'sv-SE' | 'en-US'
  } | null>(null)
  const [selectedTextTerm, setSelectedTextTerm] = useState<{
    source: string
    translation: string
    lang: 'sv-SE' | 'en-US'
  } | null>(null)
  const [showWordEnglish, setShowWordEnglish] = useState(true)
  const [autoSpeakWordOnHover, setAutoSpeakWordOnHover] = useState(false)
  const [slowListeningMode, setSlowListeningMode] = useState(false)
  const [visibleListeningTranscripts, setVisibleListeningTranscripts] = useState<Record<string, boolean>>({})
  const [listeningPracticeAnswers, setListeningPracticeAnswers] = useState<Record<string, Record<string, string>>>({})
  const [featuredListeningTopicId, setFeaturedListeningTopicId] = useState<string | null>(null)
  const [selectedRealScenarioId, setSelectedRealScenarioId] = useState(realExamScenarios[0].id)
  const [realExamStage, setRealExamStage] = useState<
    'ready' | 'countdown' | 'intro' | 'pause' | 'main' | 'finished'
  >('ready')
  const [showRealTranscript, setShowRealTranscript] = useState(false)
  const [realExamAnswers, setRealExamAnswers] = useState<Record<string, string>>({})
  const [realExamCountdown, setRealExamCountdown] = useState<number | null>(null)
  const [realExamSoundIndicator, setRealExamSoundIndicator] = useState('Waiting')
  const [liveCaptionIndex, setLiveCaptionIndex] = useState(-1)
  const [liveCaptionHeardCount, setLiveCaptionHeardCount] = useState(0)
  const [isInstructionPlayback, setIsInstructionPlayback] = useState(false)
  const [liveCaptionMode, setLiveCaptionMode] = useState<'learning' | 'strict'>('learning')
  const [isPracticeAudioRunning, setIsPracticeAudioRunning] = useState(false)
  const [practiceLiveTopicId, setPracticeLiveTopicId] = useState<string | null>(null)
  const [practiceLiveCaptionIndex, setPracticeLiveCaptionIndex] = useState(-1)
  const [practiceLiveHeardCount, setPracticeLiveHeardCount] = useState(0)
  const [realExamPlayCounts, setRealExamPlayCounts] = useState<Record<string, number>>({})
  const [realExamMode, setRealExamMode] = useState<'single' | 'full'>('single')
  const [fullRealTestStarted, setFullRealTestStarted] = useState(false)
  const [selectedRealWritingScenarioId, setSelectedRealWritingScenarioId] = useState(
    realWritingScenarios[0].id,
  )
  const [listeningCandidateInfo, setListeningCandidateInfo] = useState({
    namn: '',
    datum: getTodayIsoDate(),
    personnummer: '',
  })
  const [writingCandidateInfo, setWritingCandidateInfo] = useState({
    namn: '',
    datum: getTodayIsoDate(),
    personnummer: '',
  })
  const [realWritingStage, setRealWritingStage] = useState<
    'ready' | 'plan' | 'write' | 'review' | 'finished'
  >('ready')
  const [realWritingMode, setRealWritingMode] = useState<'single' | 'full'>('single')
  const [fullRealWritingStarted, setFullRealWritingStarted] = useState(false)
  const [realWritingAnswers, setRealWritingAnswers] = useState<Record<string, string>>({})
  const [listeningPaperTimeLeft, setListeningPaperTimeLeft] = useState<number | null>(12 * 60)
  const [writingPaperTimeLeft, setWritingPaperTimeLeft] = useState<number | null>(35 * 60)
  const [isFullscreenExam, setIsFullscreenExam] = useState(false)
  const [examAnswers, setExamAnswers] = useState<ExamAnswers>(readStorage<ExamAnswers>('yki-exam-answers', {}))
  const [completedExams, setCompletedExams] = useState<string[]>(
    readStorage<string[]>('yki-completed-exams', []),
  )
  const realCaptionContainerRef = useRef<HTMLDivElement | null>(null)
  const practiceCaptionContainerRef = useRef<HTMLDivElement | null>(null)
  const realExamPauseRef = useRef<number | null>(null)
  const realExamAudioContextRef = useRef<AudioContext | null>(null)
  const realExamRunTokenRef = useRef(0)
  const practiceRunTokenRef = useRef(0)
  const writingPracticeRef = useRef<HTMLElement | null>(null)

  const selectedExam = useMemo(
    () => mockExams.find((exam) => exam.id === selectedExamId) ?? mockExams[0],
    [selectedExamId],
  )

  const sections = useMemo(
    () => [...selectedExam.listeningSections, ...selectedExam.writingSections],
    [selectedExam],
  )

  const currentSection = sections[activeSectionIndex]
  const allListeningPracticeTopics = useMemo(
    () => listeningPracticeGroups.flatMap((group) => group.topics),
    [],
  )
  const featuredListeningTopic =
    allListeningPracticeTopics.find((topic) => topic.id === featuredListeningTopicId) ?? null
  const selectedRealScenario =
    realExamScenarios.find((scenario) => scenario.id === selectedRealScenarioId) ?? realExamScenarios[0]
  const currentRealScenarioPlayCount = realExamPlayCounts[selectedRealScenarioId] ?? 0
  const isRealExamPlayLimitReached = currentRealScenarioPlayCount >= 2
  const selectedRealWritingScenario =
    realWritingScenarios.find((scenario) => scenario.id === selectedRealWritingScenarioId) ??
    realWritingScenarios[0]
  const writingTopicTermPairs = useMemo(() => {
    const splitTerms = (value: string) =>
      value
        .split(':')
        .flatMap((part) => part.split(','))
        .map((part) => part.trim())
        .filter(Boolean)

    const pairs = bilingualWritingTopics.flatMap((group) =>
      group.topics.flatMap((topic) => {
        const enTerms = splitTerms(topic.en)
        const svTerms = splitTerms(topic.sv)
        const len = Math.min(enTerms.length, svTerms.length)
        return Array.from({ length: len }, (_, index) => ({ en: enTerms[index], sv: svTerms[index] }))
      }),
    )

    const uniqueMap = new Map<string, { en: string; sv: string }>()
    pairs.forEach((pair) => {
      uniqueMap.set(`${pair.en.toLowerCase()}|${pair.sv.toLowerCase()}`, pair)
    })
    return Array.from(uniqueMap.values())
  }, [])
  const selectedListeningPaperExam = realListeningPaperExams[0]
  const selectedWritingPaperExam = realWritingPaperExams[0]
  const splitIntoSentences = (value: string) =>
    value
      .split(/(?<=[.!?])\s+/)
      .map((item) => item.trim())
      .filter(Boolean)
  const liveCaptionLines = useMemo(() => {
    const swedishLines = splitIntoSentences(
      `${selectedRealScenario.instructionSv} ${selectedRealScenario.introSv} ${selectedRealScenario.mainSv}`,
    )
    const englishLines = splitIntoSentences(
      `${selectedRealScenario.instructionEn} ${selectedRealScenario.transcriptEn}`,
    )
    return swedishLines.map((sv, index) => ({
      sv,
      en: englishLines[index] ?? translateToEnglish(sv),
    }))
  }, [selectedRealScenario])
  const practiceLiveTopic =
    allListeningPracticeTopics.find((topic) => topic.id === practiceLiveTopicId) ?? featuredListeningTopic
  const practiceLiveLines = useMemo(() => {
    if (!practiceLiveTopic) {
      return [] as { sv: string; en: string }[]
    }
    const svLines = splitIntoSentences(practiceLiveTopic.transcriptSv)
    const enLines = splitIntoSentences(practiceLiveTopic.transcriptEn)
    return svLines.map((sv, index) => ({
      sv,
      en: enLines[index] ?? translateToEnglish(sv),
    }))
  }, [practiceLiveTopic])
  const isRealExamAudioRunning =
    isInstructionPlayback ||
    realExamStage === 'countdown' ||
    realExamStage === 'intro' ||
    realExamStage === 'pause' ||
    realExamStage === 'main'
  const showLiveCaptionsNow = liveCaptionMode === 'learning' || isRealExamAudioRunning
  const isPaperMode =
    activeTab === 'realListeningPaper' ||
    activeTab === 'realListeningPaperEnglish' ||
    activeTab === 'realWritingPaper' ||
    activeTab === 'realWritingPaperEnglish'

  useEffect(() => {
    window.localStorage.setItem('yki-exam-answers', JSON.stringify(examAnswers))
  }, [examAnswers])

  useEffect(() => {
    window.localStorage.setItem('yki-completed-exams', JSON.stringify(completedExams))
  }, [completedExams])

  useEffect(() => {
    if (!examStarted || timeLeft === null || showResults) {
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current === null || current <= 1) {
          window.clearInterval(timer)
          setShowResults(true)
          setExamStarted(false)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [examStarted, timeLeft, showResults])

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (realExamPauseRef.current !== null) {
        window.clearTimeout(realExamPauseRef.current)
      }
      realExamAudioContextRef.current?.close().catch(() => undefined)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreenExam(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (
      (activeTab !== 'realListeningPaper' && activeTab !== 'realListeningPaperEnglish') ||
      listeningPaperTimeLeft === null ||
      listeningPaperTimeLeft <= 0
    ) {
      return
    }

    const timer = window.setInterval(() => {
      setListeningPaperTimeLeft((current) => {
        if (current === null || current <= 1) {
          window.clearInterval(timer)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [activeTab, listeningPaperTimeLeft])

  useEffect(() => {
    if (
      (activeTab !== 'realWritingPaper' && activeTab !== 'realWritingPaperEnglish') ||
      writingPaperTimeLeft === null ||
      writingPaperTimeLeft <= 0
    ) {
      return
    }

    const timer = window.setInterval(() => {
      setWritingPaperTimeLeft((current) => {
        if (current === null || current <= 1) {
          window.clearInterval(timer)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [activeTab, writingPaperTimeLeft])

  useEffect(() => {
    setLiveCaptionIndex(-1)
    setLiveCaptionHeardCount(0)
  }, [selectedRealScenarioId])

  useEffect(() => {
    setPracticeLiveCaptionIndex(-1)
    setPracticeLiveHeardCount(0)
  }, [practiceLiveTopicId])

  useEffect(() => {
    if (!isRealExamAudioRunning) {
      return
    }
    const container = realCaptionContainerRef.current
    if (!container) {
      return
    }
    const active = container.querySelector('.caption-line.active') as HTMLElement | null
    active?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [liveCaptionIndex, isRealExamAudioRunning, activeTab])

  useEffect(() => {
    if (!isPracticeAudioRunning) {
      return
    }
    const container = practiceCaptionContainerRef.current
    if (!container) {
      return
    }
    const active = container.querySelector('.caption-line.active') as HTMLElement | null
    active?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [practiceLiveCaptionIndex, isPracticeAudioRunning, activeTab])

  useEffect(() => {
    if (activeTab !== 'writingPractice') {
      setSelectedTextTerm(null)
      return
    }

    const handleSelectionChange = () => {
      const root = writingPracticeRef.current
      if (!root) {
        return
      }
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setSelectedTextTerm(null)
        return
      }
      const range = selection.getRangeAt(0)
      const selectedText = selection.toString().trim()
      const anchorNode = range.commonAncestorContainer
      const isInside = root.contains(anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentNode : anchorNode)
      if (!isInside || !selectedText) {
        setSelectedTextTerm(null)
        return
      }
      const normalized = selectedText.toLowerCase()
      const match = writingTopicTermPairs.find(
        (pair) => pair.sv.toLowerCase() === normalized || pair.en.toLowerCase() === normalized,
      )
      const isLikelySwedish = /[åäö]/i.test(selectedText)
      setSelectedTextTerm({
        source: selectedText,
        translation: match
          ? match.sv.toLowerCase() === normalized
            ? match.en
            : match.sv
          : 'No saved translation yet',
        lang: isLikelySwedish ? 'sv-SE' : 'en-US',
      })
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [activeTab, writingTopicTermPairs])

  const progressPercentage = Math.round((completedExams.length / mockExams.length) * 100)

  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId)
    setExamStarted(false)
    setShowResults(false)
    setActiveSectionIndex(0)
    setTimeLeft(null)
    setPlayCounts({})
    setShowTranscript(false)
  }

  const updateAnswer = (questionId: string, value: string) => {
    setExamAnswers((current) => ({
      ...current,
      [selectedExam.id]: {
        ...current[selectedExam.id],
        [questionId]: value,
      },
    }))
  }

  const playAudio = (sectionId: string, text: string) => {
    const plays = playCounts[sectionId] ?? 0
    if (plays >= 2 || !('speechSynthesis' in window)) {
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'sv-SE'
    utterance.rate = 0.9
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setPlayCounts((current) => ({
      ...current,
      [sectionId]: plays + 1,
    }))
  }

  const playPracticeAudio = (topicId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      return
    }
    const runToken = practiceRunTokenRef.current + 1
    practiceRunTokenRef.current = runToken
    const topic = allListeningPracticeTopics.find((item) => item.id === topicId)
    const lines = splitIntoSentences(text)

    setFeaturedListeningTopicId(topicId)
    setPracticeLiveTopicId(topicId)
    setPracticeLiveCaptionIndex(-1)
    setPracticeLiveHeardCount(0)
    setIsPracticeAudioRunning(true)

    const speakPracticeLine = (lineIndex: number) => {
      if (practiceRunTokenRef.current !== runToken) {
        return
      }
      if (lineIndex >= lines.length) {
        setIsPracticeAudioRunning(false)
        return
      }

      const utterance = new SpeechSynthesisUtterance(lines[lineIndex])
      utterance.lang = 'sv-SE'
      utterance.rate = slowListeningMode ? 0.65 : 0.9
      utterance.onend = () => speakPracticeLine(lineIndex + 1)
      setPracticeLiveCaptionIndex(lineIndex)
      setPracticeLiveHeardCount((current) => Math.max(current, lineIndex + 1))
      if (lineIndex === 0) {
        window.speechSynthesis.cancel()
      }
      window.speechSynthesis.speak(utterance)
    }

    speakPracticeLine(0)
    if (!topic) {
      setIsPracticeAudioRunning(false)
    }
  }

  const playStageIndicatorSound = (frequency: number, durationMs: number) => {
    if (typeof window === 'undefined') {
      return
    }

    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) {
      return
    }

    if (!realExamAudioContextRef.current) {
      realExamAudioContextRef.current = new AudioContextClass()
    }

    const context = realExamAudioContextRef.current
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gainNode.gain.value = 0.035
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + durationMs / 1000)
  }

  const setStageSoundCue = (label: string, frequency: number, durationMs = 120) => {
    setRealExamSoundIndicator(label)
    playStageIndicatorSound(frequency, durationMs)
  }

  const clearRealExamTimer = () => {
    if (realExamPauseRef.current !== null) {
      window.clearTimeout(realExamPauseRef.current)
      realExamPauseRef.current = null
    }
  }

  const speakSwedishText = (text: string, onEnd?: () => void, cancelBeforeSpeak = true) => {
    if (!('speechSynthesis' in window)) {
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'sv-SE'
    utterance.rate = slowListeningMode ? 0.65 : 0.9
    utterance.onend = () => onEnd?.()
    if (cancelBeforeSpeak) {
      window.speechSynthesis.cancel()
    }
    window.speechSynthesis.speak(utterance)
  }

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    realExamRunTokenRef.current += 1
    practiceRunTokenRef.current += 1
    clearRealExamTimer()
    setRealExamStage('ready')
    setRealExamCountdown(null)
    setRealExamSoundIndicator('Stopped')
    setLiveCaptionIndex(-1)
    setIsInstructionPlayback(false)
    setIsPracticeAudioRunning(false)
    setPracticeLiveCaptionIndex(-1)
  }

  const replayLiveCaptionLine = (text: string) => {
    if (!('speechSynthesis' in window) || isRealExamAudioRunning) {
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'sv-SE'
    utterance.rate = 0.58
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const startExam = () => {
    setExamStarted(true)
    setShowResults(false)
    setActiveSectionIndex(0)
    setShowTranscript(false)
    setPlayCounts({})
    setTimeLeft(selectedExam.durationMinutes * 60)
  }

  const startFromSection = (sectionIndex: number) => {
    setExamStarted(true)
    setShowResults(false)
    setActiveSectionIndex(sectionIndex)
    setShowTranscript(false)
    setPlayCounts({})
    setTimeLeft(selectedExam.durationMinutes * 60)
  }

  const nextSection = () => {
    if (activeSectionIndex >= sections.length - 1) {
      setShowResults(true)
      setExamStarted(false)
      if (!completedExams.includes(selectedExam.id)) {
        setCompletedExams((current) => [...current, selectedExam.id])
      }
      return
    }

    setActiveSectionIndex((current) => current + 1)
    setShowTranscript(false)
  }

  const previousSection = () => {
    if (activeSectionIndex === 0) {
      return
    }

    setActiveSectionIndex((current) => current - 1)
    setShowTranscript(false)
  }

  const restartExam = () => {
    setExamAnswers((current) => ({
      ...current,
      [selectedExam.id]: {},
    }))
    setShowResults(false)
    startExam()
  }

  const copyTemplate = async (title: string, text: string) => {
    try {
      await window.navigator.clipboard.writeText(text)
      setCopiedTemplate(title)
      window.setTimeout(() => setCopiedTemplate((current) => (current === title ? null : current)), 1800)
    } catch {
      setCopiedTemplate(null)
    }
  }

  const speakWithLang = (text: string, lang: 'sv-SE' | 'en-US') => {
    if (!('speechSynthesis' in window) || !text.trim()) {
      return
    }
    const utterance = new SpeechSynthesisUtterance(text.trim())
    utterance.lang = lang
    utterance.rate = 0.88
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const findTopicTermInfo = (term: string) => {
    const normalized = term.toLowerCase()
    const match = writingTopicTermPairs.find(
      (pair) => pair.sv.toLowerCase() === normalized || pair.en.toLowerCase() === normalized,
    )
    if (!match) {
      return null
    }
    const isSwedishTerm = match.sv.toLowerCase() === normalized
    return {
      source: term,
      translation: isSwedishTerm ? match.en : match.sv,
      lang: isSwedishTerm ? ('sv-SE' as const) : ('en-US' as const),
    }
  }

  const renderInteractiveTopicLine = (line: string, keyPrefix: string) => {
    const chunks = line.split(/([:,])/)
    return (
      <span className="interactive-topic-line">
        {chunks.map((chunk, index) => {
          const value = chunk.trim()
          if (!value) {
            return (
              <span key={`${keyPrefix}-space-${index}`} className="topic-separator">
                {chunk}
              </span>
            )
          }
          if (value === ':' || value === ',') {
            return (
              <span key={`${keyPrefix}-sep-${index}`} className="topic-separator">
                {chunk}
              </span>
            )
          }
          const info = findTopicTermInfo(value)
          if (!info) {
            return <span key={`${keyPrefix}-plain-${index}`}>{chunk}</span>
          }
          return (
            <button
              key={`${keyPrefix}-term-${index}`}
              type="button"
              className="topic-term-button"
              onClick={() => {
                setSelectedTopicTerm(info)
                speakWithLang(info.source, info.lang)
              }}
              onMouseEnter={() => {
                if (autoSpeakWordOnHover) {
                  speakWithLang(info.source, info.lang)
                }
              }}
              title={`Play "${info.source}"`}
            >
              {chunk}
            </button>
          )
        })}
      </span>
    )
  }

  const getWritingPracticeTaskDetail = (topic: { en: string; sv: string }) => {
    const explicit = writingPracticeTaskDetails[topic.en]
    if (explicit) {
      return explicit
    }
    const isPractical = topic.en.includes(':')
    return {
      patternSv: isPractical ? 'Praktiskt meddelande' : 'Åsiktstext',
      instructionSv: isPractical
        ? `Skriv ett praktiskt meddelande om temat: ${topic.sv}. Beskriv situationen tydligt och be om den hjälp eller information du behöver.`
        : `Skriv en åsiktstext om temat: ${topic.sv}. Skriv din åsikt tydligt och ge flera skäl.`,
      promptSv: isPractical
        ? 'Skriv ett tydligt meddelande. Svara på alla delar och avsluta artigt.'
        : 'Skriv en tydlig åsiktstext med enkel struktur och kort slutsats.',
      checklist: isPractical
        ? ['Vad är situationen?', 'Vad behöver du?', 'Vad frågar du om?', 'Avslutar du artigt?']
        : ['Skriv din åsikt tidigt.', 'Ge minst två skäl.', 'Lägg till ett exempel.', 'Avsluta tydligt.'],
    }
  }

  const toggleListeningTranscript = (topicId: string) => {
    setVisibleListeningTranscripts((current) => ({
      ...current,
      [topicId]: !current[topicId],
    }))
  }

  const updateListeningPracticeAnswer = (topicId: string, questionId: string, value: string) => {
    setListeningPracticeAnswers((current) => ({
      ...current,
      [topicId]: {
        ...current[topicId],
        [questionId]: value,
      },
    }))
  }

  const getPracticeQuestionStatus = (topicId: string, question: ListeningQuestion) => {
    const answer = listeningPracticeAnswers[topicId]?.[question.id] ?? ''
    if (!answer.trim()) {
      return null
    }

    if (question.type === 'short') {
      const normalizedAnswer = normalize(answer)
      const accepted = question.acceptedAnswers ?? []
      return accepted.some((item) => normalizedAnswer.includes(normalize(item)))
    }

    return answer === question.correctAnswer
  }

  const pickRandomListeningTopic = () => {
    if (allListeningPracticeTopics.length === 0) {
      return
    }

    const randomTopic =
      allListeningPracticeTopics[Math.floor(Math.random() * allListeningPracticeTopics.length)]
    setFeaturedListeningTopicId(randomTopic.id)
  }

  const updateRealExamAnswer = (questionId: string, value: string) => {
    setRealExamAnswers((current) => ({
      ...current,
      [questionId]: value,
    }))
  }

  const getRealExamQuestionStatus = (question: ListeningQuestion) => {
    const answer = realExamAnswers[question.id] ?? ''
    if (!answer.trim()) {
      return null
    }

    if (question.type === 'short') {
      const normalizedAnswer = normalize(answer)
      const accepted = question.acceptedAnswers ?? []
      return accepted.some((item) => normalizedAnswer.includes(normalize(item)))
    }

    return answer === question.correctAnswer
  }

  const startRealExamScenario = (scenarioId?: string, modeOverride?: 'single' | 'full') => {
    const scenario =
      realExamScenarios.find((item) => item.id === (scenarioId ?? selectedRealScenarioId)) ??
      selectedRealScenario
    const runMode = modeOverride ?? realExamMode
    const currentPlays = realExamPlayCounts[scenario.id] ?? 0
    if (currentPlays >= 2) {
      setRealExamSoundIndicator('Two-play limit reached')
      return
    }

    setSelectedRealScenarioId(scenario.id)
    setShowRealTranscript(false)
    clearRealExamTimer()
    const runToken = realExamRunTokenRef.current + 1
    realExamRunTokenRef.current = runToken
    setLiveCaptionIndex(-1)
    setLiveCaptionHeardCount(0)
    setIsInstructionPlayback(false)
    setRealExamPlayCounts((current) => ({
      ...current,
      [scenario.id]: currentPlays + 1,
    }))
    setRealExamStage('countdown')
    setRealExamCountdown(3)
    setStageSoundCue('Countdown tone', 740)

    const runCountdown = (value: number) => {
      if (realExamRunTokenRef.current !== runToken) {
        return
      }
      setRealExamCountdown(value)
      setStageSoundCue(`Countdown ${value}`, 620 + value * 60, 90)

      if (value === 0) {
        setRealExamCountdown(null)
        setRealExamStage('ready')
        setStageSoundCue('Instruction tone', 760)
        setIsInstructionPlayback(true)
        const instructionLines = scenario.instructionSv
          .split(/(?<=[.!?])\s+/)
          .map((line) => line.trim())
          .filter(Boolean)
        const introLines = scenario.introSv
          .split(/(?<=[.!?])\s+/)
          .map((line) => line.trim())
          .filter(Boolean)
        const mainLines = scenario.mainSv
          .split(/(?<=[.!?])\s+/)
          .map((line) => line.trim())
          .filter(Boolean)

        const speakLines = (
          lines: string[],
          baseIndex: number,
          done: () => void,
          lineIndex = 0,
        ) => {
          if (realExamRunTokenRef.current !== runToken) {
            return
          }
          if (lineIndex >= lines.length) {
            done()
            return
          }
          setLiveCaptionIndex(baseIndex + lineIndex)
          setLiveCaptionHeardCount((current) => Math.max(current, baseIndex + lineIndex + 1))
          speakSwedishText(lines[lineIndex], () => speakLines(lines, baseIndex, done, lineIndex + 1), lineIndex === 0)
        }

        speakLines(instructionLines, 0, () => {
          if (realExamRunTokenRef.current !== runToken) {
            return
          }
          setIsInstructionPlayback(false)
          setRealExamStage('intro')
          setStageSoundCue('Intro tone', 880)
          speakLines(introLines, instructionLines.length, () => {
            if (realExamRunTokenRef.current !== runToken) {
              return
            }
          setRealExamStage('pause')
          setStageSoundCue('Pause tone', 520)
          realExamPauseRef.current = window.setTimeout(() => {
            if (realExamRunTokenRef.current !== runToken) {
              return
            }
            setRealExamStage('main')
            setStageSoundCue('Main audio tone', 980)
            speakLines(mainLines, instructionLines.length + introLines.length, () => {
              if (realExamRunTokenRef.current !== runToken) {
                return
              }
              setRealExamStage('finished')
              setStageSoundCue('Finish tone', 680, 160)

              const playsAfterFinish = currentPlays + 1
              if (runMode === 'full') {
                if (playsAfterFinish < 2) {
                  realExamPauseRef.current = window.setTimeout(() => {
                    startRealExamScenario(scenario.id, 'full')
                  }, 2200)
                  return
                }

                const scenarioIndex = realExamScenarios.findIndex((item) => item.id === scenario.id)
                const nextScenario = realExamScenarios[scenarioIndex + 1]
                if (nextScenario) {
                  realExamPauseRef.current = window.setTimeout(() => {
                    setSelectedRealScenarioId(nextScenario.id)
                    startRealExamScenario(nextScenario.id, 'full')
                  }, 2600)
                } else {
                  setFullRealTestStarted(false)
                }
              }
            })
          }, scenario.pauseMs)
          })
        })
        return
      }

      realExamPauseRef.current = window.setTimeout(() => runCountdown(value - 1), 1000)
    }

    runCountdown(3)
  }

  const resetRealExamSession = (keepMode = true) => {
    stopAudio()
    setShowRealTranscript(false)
    setRealExamAnswers({})
    setRealExamPlayCounts({})
    setRealExamCountdown(null)
    setRealExamSoundIndicator('Waiting')
    setFullRealTestStarted(false)
    if (!keepMode) {
      setRealExamMode('single')
    }
  }

  const startFullRealExamTest = () => {
    resetRealExamSession(true)
    setRealExamMode('full')
    setFullRealTestStarted(true)
    setSelectedRealScenarioId(realExamScenarios[0].id)
    startRealExamScenario(realExamScenarios[0].id, 'full')
  }

  const updateRealWritingAnswer = (scenarioId: string, value: string) => {
    setRealWritingAnswers((current) => ({
      ...current,
      [scenarioId]: value,
    }))
  }

  const resetRealWritingSession = (keepMode = true) => {
    setRealWritingStage('ready')
    setRealWritingAnswers({})
    setFullRealWritingStarted(false)
    if (!keepMode) {
      setRealWritingMode('single')
    }
  }

  const startRealWritingScenario = (scenarioId?: string) => {
    const scenario =
      realWritingScenarios.find((item) => item.id === (scenarioId ?? selectedRealWritingScenarioId)) ??
      selectedRealWritingScenario

    setSelectedRealWritingScenarioId(scenario.id)
    setRealWritingStage('plan')
    setRealWritingAnswers((current) => ({
      ...current,
      [scenario.id]: current[scenario.id] ?? scenario.starter,
    }))
  }

  const moveRealWritingStage = () => {
    setRealWritingStage((current) => {
      if (current === 'ready') {
        return 'plan'
      }
      if (current === 'plan') {
        return 'write'
      }
      if (current === 'write') {
        return 'review'
      }
      if (current === 'review') {
        return 'finished'
      }
      return 'finished'
    })
  }

  const startFullRealWritingTest = () => {
    resetRealWritingSession(true)
    setRealWritingMode('full')
    setFullRealWritingStarted(true)
    setSelectedRealWritingScenarioId(realWritingScenarios[0].id)
    startRealWritingScenario(realWritingScenarios[0].id)
  }

  const formatSwedishTime = (seconds: number | null) => {
    if (seconds === null) {
      return '0:00'
    }

    const minuter = Math.floor(seconds / 60)
    const sekunder = seconds % 60
    return `${minuter}:${sekunder.toString().padStart(2, '0')}`
  }

  const formatTargetWordsSv = (value: string) => value.replace('words', 'ord')
  const translateWritingChecklistItem = (value: string) =>
    (
      {
        'Vad är problemet?': 'What is the problem?',
        'Hur länge har det pågått?': 'How long has it been going on?',
        'Varför är det svårt?': 'Why is it difficult?',
        'Vad vill du att de ska göra?': 'What do you want them to do?',
        'Skriv din åsikt tidigt.': 'State your opinion early.',
        'Ge minst tre skäl.': 'Give at least three reasons.',
        'Lägg till ett exempel.': 'Add one example.',
        'Avsluta tydligt.': 'Finish clearly.',
        'Varför var barnet borta?': 'Why was the child absent?',
        'Vilken information behöver du?': 'Which information do you need?',
        'Hur kan barnet arbeta ikapp?': 'How can the child catch up?',
      } as Record<string, string>
    )[value] ?? value

  const toggleExamFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }

      await (appShellRef.current ?? document.documentElement).requestFullscreen()
    } catch {
      setIsFullscreenExam(Boolean(document.fullscreenElement))
    }
  }

  const moveToNextRealWritingScenario = () => {
    const currentIndex = realWritingScenarios.findIndex(
      (scenario) => scenario.id === selectedRealWritingScenarioId,
    )
    const nextScenario = realWritingScenarios[currentIndex + 1]

    if (!nextScenario) {
      setFullRealWritingStarted(false)
      setRealWritingStage('finished')
      return
    }

    setSelectedRealWritingScenarioId(nextScenario.id)
    startRealWritingScenario(nextScenario.id)
  }

  const formatTime = (seconds: number | null) => {
    if (seconds === null) {
      return `${selectedExam.durationMinutes}:00`
    }
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const objectiveQuestions = selectedExam.listeningSections.flatMap((section) => section.questions)
  const objectiveScore = objectiveQuestions.reduce((score, question) => {
    const answer = examAnswers[selectedExam.id]?.[question.id] ?? ''
    if (question.type === 'short') {
      const normalizedAnswer = normalize(answer)
      const accepted = question.acceptedAnswers ?? []
      return accepted.some((item) => normalizedAnswer.includes(normalize(item))) ? score + 1 : score
    }

    return answer === question.correctAnswer ? score + 1 : score
  }, 0)

  const writingResults = selectedExam.writingSections.map((section) => {
    const text = examAnswers[selectedExam.id]?.[section.id] ?? section.starter
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length
    return {
      id: section.id,
      title: section.title,
      wordCount,
      status:
        section.id.endsWith('1')
          ? wordCount >= 70
          : wordCount >= 110,
    }
  })

  void themeTranslations
  void getEnglishHelpText
  void currentSection
  void progressPercentage
  void handleSelectExam
  void updateAnswer
  void playAudio
  void startFromSection
  void nextSection
  void previousSection
  void restartExam
  void formatTime
  void objectiveScore
  void writingResults

  return (
    <div ref={appShellRef} className={isPaperMode ? 'app-shell exam-focus-shell' : 'app-shell'}>
      {!isPaperMode && (
        <header className="hero hero-exam">
        <div className="hero-copy">
          <p className="eyebrow">YKI Swedish B1 simulator</p>
          <h1>Train with realistic listening and writing practice</h1>
          <p className="hero-text">
            This website now focuses on practical YKI-style preparation: listening drills, writing
            drills, real exam scenario flow, and realistic `B1` everyday topics. It is built for
            pattern recognition and exam confidence rather than full mock exam packs.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => setActiveTab('realExamScenario')}
            >
              Open real listening
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setActiveTab('realWritingScenario')}
            >
              Open real writing
            </button>
          </div>
        </div>

        <aside className="progress-card hall-summary">
          <p className="card-label">Focus now</p>
          <strong>Real practice</strong>
          <p>
            The app now focuses on exam-style listening and writing behavior instead of old full
            mock exam packs.
          </p>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: '100%' }} />
          </div>
          <ul className="mini-stats">
            <li>Listening practice and real listening flow</li>
            <li>Writing practice and real writing flow</li>
            <li>Scenario-based exam training</li>
          </ul>
        </aside>
        </header>
      )}

      {!isPaperMode && (
        <nav className="tab-bar" aria-label="Main sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        </nav>
      )}


      {activeTab === 'writingPractice' && (
        <main className="content-grid">
          <section
            ref={writingPracticeRef}
            className="panel"
            onMouseUp={() => window.dispatchEvent(new Event('selectionchange'))}
            onKeyUp={() => window.dispatchEvent(new Event('selectionchange'))}
            onTouchEnd={() => window.dispatchEvent(new Event('selectionchange'))}
          >
            <p className="card-label">Writing practice</p>
            <h2>Important writing topics to practise again and again</h2>
            <div className="hero-actions compact-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowWordEnglish((current) => !current)}
              >
                Translation: {showWordEnglish ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setAutoSpeakWordOnHover((current) => !current)}
              >
                Hover audio: {autoSpeakWordOnHover ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setSelectedTopicTerm(null)
                  setSelectedTextTerm(null)
                }}
              >
                Clear selected
              </button>
            </div>
            {selectedTopicTerm && (
              <article className="task-card plain-task-card">
                <h3>Selected term</h3>
                <p>
                  <strong>{selectedTopicTerm.source}</strong>
                </p>
                {showWordEnglish && (
                  <p className="inline-translation">{translateToEnglish(selectedTopicTerm.translation)}</p>
                )}
                <div className="hero-actions compact-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => speakWithLang(selectedTopicTerm.source, selectedTopicTerm.lang)}
                  >
                    Play selected term audio
                  </button>
                </div>
              </article>
            )}
            {selectedTextTerm && (
              <article className="task-card plain-task-card">
                <h3>Selected text</h3>
                <p>
                  <strong>{selectedTextTerm.source}</strong>
                </p>
                {showWordEnglish && (
                  <p className="inline-translation">{translateToEnglish(selectedTextTerm.translation)}</p>
                )}
                <div className="hero-actions compact-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => speakWithLang(selectedTextTerm.source, selectedTextTerm.lang)}
                  >
                    Play selected audio
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      window.getSelection()?.removeAllRanges()
                      setSelectedTextTerm(null)
                    }}
                  >
                    Clear selection
                  </button>
                </div>
              </article>
            )}
            <div className="plan-grid">
              {bilingualWritingTopics.map((group) => (
                <article key={group.title} className="info-card">
                  <h3>{group.title}</h3>
                  <p className="inline-translation">{group.titleSv}</p>
                  <div className="shortcut-sign">{group.formula}</div>
                  <div className="topic-answer-list">
                    {group.topics.map((topic) => (
                      <article key={topic.en} className="topic-answer-card">
                        <strong>{renderInteractiveTopicLine(topic.en, `${topic.en}-en`)}</strong>
                        <span className="english-line">
                          {renderInteractiveTopicLine(topic.sv, `${topic.en}-sv`)}
                        </span>
                        {(() => {
                          const detail = getWritingPracticeTaskDetail(topic)
                          return (
                            <div className="topic-answer-block">
                              <h4>Exam-style task (Svenska)</h4>
                              <p className="plain-exam-note">Typ: {detail.patternSv}</p>
                              <p>{detail.instructionSv}</p>
                              <p className="instruction">{detail.promptSv}</p>
                              <p className="plain-exam-note">Det ska framgå i texten:</p>
                              <ul>
                                {detail.checklist.map((item) => (
                                  <li key={`${topic.en}-${item}`}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )
                        })()}
                        <div className="topic-answer-block">
                          <h4>Sample answer in Swedish</h4>
                          <pre className="template-pre">{topic.answerSv}</pre>
                        </div>
                        <div className="topic-answer-block">
                          <h4>Sample answer in English</h4>
                          <pre className="template-pre">{topic.answerEn}</pre>
                        </div>
                        <div className="topic-answer-block">
                          <h4>Sentence by sentence</h4>
                          <div className="sentence-grid">
                            {splitAnswerLines(topic.answerSv).map((sentence, index) => (
                              <article key={`${topic.en}-sentence-${index}`} className="sentence-card">
                                <strong>SV {index + 1}</strong>
                                <p>{highlightText(sentence, topic.keywords)}</p>
                                <strong>EN {index + 1}</strong>
                                <p>{highlightText(splitAnswerLines(topic.answerEn)[index] ?? '', topic.keywords)}</p>
                              </article>
                            ))}
                          </div>
                        </div>
                        <p className="topic-trick">
                          <strong>Memory trick:</strong> {topic.trick}
                        </p>
                      </article>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="card-label">Mini templates</p>
            <h2>Remember these instead of full answers</h2>
            <div className="plan-grid">
              {writingMiniTemplates.map((template) => (
                <article key={template.title} className="info-card">
                  <h3>{template.title}</h3>
                  <div className="shortcut-sign">{template.sign}</div>
                  <button
                    type="button"
                    className="secondary-button copy-button"
                    onClick={() => copyTemplate(template.title, template.text)}
                  >
                    {copiedTemplate === template.title ? 'Copied' : 'Copy template'}
                  </button>
                  <pre className="template-pre">{template.text}</pre>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="card-label">Why shortcuts work</p>
            <h2>Remember a few things, not everything</h2>
            <div className="plan-grid">
              {writingShortcutTips.map((tip) => (
                <article key={`wp-${tip.title}`} className="info-card">
                  <h3>{tip.title}</h3>
                  <div className="shortcut-sign">{tip.sign}</div>
                  <p>{tip.explanation}</p>
                </article>
              ))}
            </div>
            <ul className="steps remember-list">
              {writingMemoryRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <p className="card-label">Practice path</p>
            <h2>Best way to use these topics</h2>
            <ol className="steps">
              <li>Choose one topic from the list.</li>
              <li>Read the English topic and the Swedish version together.</li>
              <li>Write one short text with the mini template only.</li>
              <li>Add just 2 more details.</li>
              <li>Compare with the mock exam sample answer later.</li>
            </ol>
          </section>
        </main>
      )}

      {activeTab === 'listeningPractice' && (
        <main className="content-grid">
          <section className="panel">
            <p className="card-label">Random listening</p>
            <h2>Pick one listening topic and practise it now</h2>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={pickRandomListeningTopic}>
                Random listening topic
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setSlowListeningMode((current) => !current)}
              >
                Slow mode: {slowListeningMode ? 'On' : 'Off'}
              </button>
              <button type="button" className="secondary-button" onClick={stopAudio}>
                Stop audio
              </button>
            </div>
            {featuredListeningTopic && (
              <article className="topic-answer-card featured-card">
                <strong>{featuredListeningTopic.en}</strong>
                <span className="english-line">{featuredListeningTopic.sv}</span>
                <p className="topic-trick">
                  <strong>Practice focus:</strong> {featuredListeningTopic.trick}
                </p>
              </article>
            )}
            <article className="task-card plain-task-card live-caption-card">
              <h3>Live practice audio text (Swedish + English)</h3>
              <p className="plain-exam-note">
                {isPracticeAudioRunning
                  ? 'Live lines appear while practice audio is running.'
                  : 'Start any topic audio to see live translation.'}
              </p>
              {practiceLiveLines.length > 0 && (
                <div ref={practiceCaptionContainerRef} className="caption-lines">
                  {practiceLiveLines
                    .filter((_, index) => index < practiceLiveHeardCount)
                    .map((line, index) => (
                      <article
                        key={`practice-live-${line.sv}-${index}`}
                        className={
                          index === practiceLiveCaptionIndex ? 'caption-line active' : 'caption-line heard'
                        }
                      >
                        <p>{line.sv}</p>
                        <p className="english-line">{line.en}</p>
                      </article>
                    ))}
                </div>
              )}
            </article>
          </section>

          <section className="panel">
            <p className="card-label">Listening practice</p>
            <h2>Important listening topics to practise again and again</h2>
            <div className="plan-grid">
              {listeningPracticeGroups.map((group) => (
                <article key={group.title} className="info-card">
                  <h3>{group.title}</h3>
                  <p className="inline-translation">{group.titleSv}</p>
                  <div className="shortcut-sign">{group.formula}</div>
                  <div className="topic-answer-list">
                    {group.topics.map((topic) => (
                      <article
                        key={topic.en}
                        className={
                          featuredListeningTopicId === topic.id
                            ? 'topic-answer-card featured-card'
                            : 'topic-answer-card'
                        }
                      >
                        <strong>{topic.en}</strong>
                        <span className="english-line">{topic.sv}</span>
                        <div className="hero-actions compact-actions">
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() => playPracticeAudio(topic.id, topic.transcriptSv)}
                          >
                            Play audio
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => toggleListeningTranscript(topic.id)}
                          >
                            {visibleListeningTranscripts[topic.id]
                              ? 'Hide transcript'
                              : 'Show transcript'}
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => setFeaturedListeningTopicId(topic.id)}
                          >
                            Focus this topic
                          </button>
                        </div>
                        <div className="chips">
                          {topic.listenFor.map((item) => (
                            <span key={`${topic.en}-${item}`} className="chip">
                              {item}
                            </span>
                          ))}
                        </div>
                        {visibleListeningTranscripts[topic.id] && (
                          <>
                            <div className="topic-answer-block">
                              <h4>Transcript in Swedish</h4>
                              <pre className="template-pre">{topic.transcriptSv}</pre>
                            </div>
                            <div className="topic-answer-block">
                              <h4>Transcript in English</h4>
                              <pre className="template-pre">{topic.transcriptEn}</pre>
                            </div>
                            <div className="topic-answer-block">
                              <h4>Sentence by sentence</h4>
                              <div className="sentence-grid">
                                {splitAnswerLines(topic.transcriptSv).map((sentence, index) => (
                                  <article key={`${topic.en}-listen-${index}`} className="sentence-card">
                                    <strong>SV {index + 1}</strong>
                                    <p>{highlightText(sentence, topic.keywords)}</p>
                                    <strong>EN {index + 1}</strong>
                                    <p>
                                      {highlightText(
                                        splitAnswerLines(topic.transcriptEn)[index] ?? '',
                                        topic.keywords,
                                      )}
                                    </p>
                                  </article>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        <div className="topic-answer-block">
                          <h4>Question set</h4>
                          <div className="question-grid answer-grid">
                            {topic.questions.map((question, index) => {
                              const status = getPracticeQuestionStatus(topic.id, question)

                              return (
                                <article key={question.id} className="question-card practice-question-card">
                                  <strong>Question {index + 1}</strong>
                                  <p>{question.prompt}</p>
                                  {question.type !== 'short' && (
                                    <div className="option-list">
                                      {(question.options ?? []).map((option) => (
                                        <label key={option} className="option-item">
                                          <input
                                            type="radio"
                                            name={question.id}
                                            value={option}
                                            checked={
                                              (listeningPracticeAnswers[topic.id]?.[question.id] ?? '') === option
                                            }
                                            onChange={(event) =>
                                              updateListeningPracticeAnswer(
                                                topic.id,
                                                question.id,
                                                event.target.value,
                                              )
                                            }
                                          />
                                          <span>{option}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                  {question.type === 'short' && (
                                    <textarea
                                      rows={3}
                                      value={listeningPracticeAnswers[topic.id]?.[question.id] ?? ''}
                                      onChange={(event) =>
                                        updateListeningPracticeAnswer(
                                          topic.id,
                                          question.id,
                                          event.target.value,
                                        )
                                      }
                                      placeholder="Write key words only"
                                    />
                                  )}
                                  {status !== null && (
                                    <p
                                      className={
                                        status ? 'practice-status correct' : 'practice-status incorrect'
                                      }
                                    >
                                      {status ? 'Looks correct' : 'Try again with key words'}
                                    </p>
                                  )}
                                </article>
                              )
                            })}
                          </div>
                        </div>
                        <p className="topic-trick">
                          <strong>Listening trick:</strong> {topic.trick}
                        </p>
                      </article>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="card-label">Note templates</p>
            <h2>Copy these before doing listening practice</h2>
            <div className="plan-grid">
              {listeningNoteTemplates.map((template) => (
                <article key={template.title} className="info-card">
                  <h3>{template.title}</h3>
                  <div className="shortcut-sign">{template.sign}</div>
                  <button
                    type="button"
                    className="secondary-button copy-button"
                    onClick={() => copyTemplate(template.title, template.text)}
                  >
                    {copiedTemplate === template.title ? 'Copied' : 'Copy template'}
                  </button>
                  <pre className="template-pre">{template.text}</pre>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="card-label">Why shortcuts work</p>
            <h2>How to understand listening faster</h2>
            <div className="plan-grid">
              {listeningShortcutTips.map((tip) => (
                <article key={`lp-${tip.title}`} className="info-card">
                  <h3>{tip.title}</h3>
                  <div className="shortcut-sign">{tip.sign}</div>
                  <p>{tip.explanation}</p>
                </article>
              ))}
            </div>
            <ul className="steps remember-list">
              {listeningMemoryRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <p className="card-label">Practice path</p>
            <h2>Best way to use these listening topics</h2>
            <ol className="steps">
              <li>Read the topic once in English and Swedish.</li>
              <li>Listen for only `who`, `time`, `place`, `reason`, and `action`.</li>
              <li>Use one copied note template while listening.</li>
              <li>Check the transcript after practice, not before.</li>
              <li>Study the highlighted key words and repeat the clip once more.</li>
            </ol>
          </section>
          <section className="sticky-audio-bar practice-sticky-bar">
            <div className="sticky-audio-content">
              <strong>Listening Practice Audio</strong>
              <span>
                Current topic: {(practiceLiveTopic ?? featuredListeningTopic)?.en ?? 'No topic selected'}
              </span>
            </div>
            <div className="hero-actions compact-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  const topic = practiceLiveTopic ?? featuredListeningTopic
                  if (!topic) {
                    return
                  }
                  playPracticeAudio(topic.id, topic.transcriptSv)
                }}
                disabled={!practiceLiveTopic && !featuredListeningTopic}
              >
                Play
              </button>
              <button type="button" className="secondary-button" onClick={stopAudio}>
                Stop
              </button>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'realExamScenario' && (
        <main className="content-grid">
          <section className="panel">
            <p className="card-label">Real exam scenario</p>
            <h2>Feel how the listening part starts in a real exam</h2>
            <div className="hero-actions">
              <button
                type="button"
                className={realExamMode === 'single' ? 'primary-button' : 'secondary-button'}
                onClick={() => {
                  resetRealExamSession(true)
                  setRealExamMode('single')
                }}
              >
                Single scenario mode
              </button>
              <button
                type="button"
                className={realExamMode === 'full' ? 'primary-button' : 'secondary-button'}
                onClick={() => {
                  resetRealExamSession(true)
                  setRealExamMode('full')
                }}
              >
                Full listening test mode
              </button>
            </div>
            <div className="hero-actions">
              {realExamScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className={scenario.id === selectedRealScenarioId ? 'selector active' : 'selector'}
                  onClick={() => {
                    stopAudio()
                    setSelectedRealScenarioId(scenario.id)
                    setRealExamStage('ready')
                    setShowRealTranscript(false)
                    setRealExamAnswers({})
                  }}
                >
                  <span>{scenario.title}</span>
                  <small>
                    {scenario.titleSv} · plays {realExamPlayCounts[scenario.id] ?? 0}/2
                  </small>
                </button>
              ))}
            </div>
            {realExamMode === 'full' && (
              <div className="trick-box">
                <h3>Full listening test</h3>
                <p>
                  This mode runs the scenarios in order. Each scenario is played automatically two
                  times only, then the next scenario starts by itself.
                </p>
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="card-label">Before play</p>
                <h2>{selectedRealScenario.title}</h2>
                <p className="inline-translation">{selectedRealScenario.titleSv}</p>
              </div>
              <div className="hero-actions">
                <div className="timer-chip">Stage: {realExamFlowInfo[realExamStage].label}</div>
                <div className="timer-chip">Sound cue: {realExamSoundIndicator}</div>
                <div className="timer-chip">Plays: {currentRealScenarioPlayCount}/2</div>
                {realExamCountdown !== null && <div className="timer-chip">Countdown: {realExamCountdown}</div>}
              </div>
            </div>

            <div className="real-flow-grid">
              {(['ready', 'countdown', 'intro', 'pause', 'main', 'finished'] as const).map(
                (stageKey, index) => (
                <article
                  key={stageKey}
                  className={
                    stageKey === realExamStage ? 'real-flow-card active' : 'real-flow-card'
                  }
                >
                  <small>Step {index + 1}</small>
                  <strong>{realExamFlowInfo[stageKey].label}</strong>
                  <span>{realExamFlowInfo[stageKey].sv}</span>
                </article>
              ))}
            </div>

            {realExamMode === 'full' && (
              <div className="real-test-strip">
                {realExamScenarios.map((scenario, index) => (
                  <article
                    key={`strip-${scenario.id}`}
                    className={
                      scenario.id === selectedRealScenarioId
                        ? 'real-test-card active'
                        : 'real-test-card'
                    }
                  >
                    <small>Part {index + 1}</small>
                    <strong>{scenario.title}</strong>
                    <span>{scenario.titleSv}</span>
                    <span>Plays {(realExamPlayCounts[scenario.id] ?? 0)}/2</span>
                  </article>
                ))}
              </div>
            )}

            <div className="paper-layout">
              <div className="paper-column">
                <div className="paper-header">
                  <strong>Instruction screen</strong>
                  <span>Instruktioner</span>
                </div>
                <div className="task-card">
                  <h3>Read before listening</h3>
                  <p>{selectedRealScenario.instructionSv}</p>
                  {showEnglishHelp && (
                    <>
                      <h3>English help</h3>
                      <p className="english-line">{selectedRealScenario.instructionEn}</p>
                    </>
                  )}
                  <div className="exam-stage-box">
                    <h3>What is happening now</h3>
                    <div className="shortcut-sign">{realExamFlowInfo[realExamStage].label}</div>
                    <p>{realExamFlowInfo[realExamStage].description}</p>
                    <p className="english-line">{realExamFlowInfo[realExamStage].translation}</p>
                    <p className="topic-trick">
                      <strong>Exam trick:</strong> {realExamFlowInfo[realExamStage].trick}
                    </p>
                  </div>
                  <div className="trick-box">
                    <h3>Real exam flow</h3>
                    <div className="shortcut-sign">
                      Instruction {'->'} Countdown {'->'} Intro {'->'} Pause {'->'} Main Audio
                    </div>
                    <p>
                      This mode simulates how the listening part feels: you read the task first,
                      get a short countdown, hear a natural opening, wait a moment, and then hear
                      the main message.
                    </p>
                  </div>
                  <div className="hero-actions">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => startRealExamScenario(selectedRealScenario.id)}
                      disabled={isRealExamPlayLimitReached || fullRealTestStarted}
                    >
                      {isRealExamPlayLimitReached ? '2 plays used' : 'Start real exam listening'}
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={startFullRealExamTest}
                      disabled={fullRealTestStarted}
                    >
                      {fullRealTestStarted ? 'Full test running' : 'Start full listening test'}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setSlowListeningMode((current) => !current)}
                    >
                      Slow mode: {slowListeningMode ? 'On' : 'Off'}
                    </button>
                    <button type="button" className="secondary-button" onClick={stopAudio}>
                      Stop audio
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => resetRealExamSession(true)}
                    >
                      Reset real exam
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setShowRealTranscript((current) => !current)}
                    >
                      {showRealTranscript ? 'Hide transcript' : 'Show transcript after practice'}
                    </button>
                  </div>
                </div>

                {showRealTranscript && (
                  <div className="task-card">
                    <h3>Transcript in Swedish</h3>
                    <pre className="template-pre">{selectedRealScenario.transcriptSv}</pre>
                    <h3>Transcript in English</h3>
                    <pre className="template-pre">{selectedRealScenario.transcriptEn}</pre>
                    <h3>Sentence by sentence</h3>
                    <div className="sentence-grid">
                      {splitAnswerLines(selectedRealScenario.transcriptSv).map((sentence, index) => (
                        <article key={`${selectedRealScenario.id}-real-${index}`} className="sentence-card">
                          <strong>SV {index + 1}</strong>
                          <p>{sentence}</p>
                          <strong>EN {index + 1}</strong>
                          <p>{splitAnswerLines(selectedRealScenario.transcriptEn)[index] ?? ''}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="paper-column answer-column">
                <div className="paper-header">
                  <strong>Answer sheet</strong>
                  <span>Svarspapper</span>
                </div>
                <div className="task-card">
                  <h3>Questions</h3>
                  <div className="question-grid answer-grid">
                    {selectedRealScenario.questions.map((question, index) => {
                      const status = getRealExamQuestionStatus(question)

                      return (
                        <article key={question.id} className="question-card practice-question-card">
                          <strong>Question {index + 1}</strong>
                          <p>{question.prompt}</p>
                          {showEnglishHelp && (
                            <p className="english-line">{translateToEnglish(question.prompt)}</p>
                          )}
                          {question.type !== 'short' && (
                            <div className="option-list">
                              {(question.options ?? []).map((option) => (
                                <label key={option} className="option-item">
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value={option}
                                    checked={(realExamAnswers[question.id] ?? '') === option}
                                    onChange={(event) =>
                                      updateRealExamAnswer(question.id, event.target.value)
                                    }
                                  />
                                  <span>{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          {question.type === 'short' && (
                            <textarea
                              rows={3}
                              value={realExamAnswers[question.id] ?? ''}
                              onChange={(event) => updateRealExamAnswer(question.id, event.target.value)}
                              placeholder="Write key words only"
                            />
                          )}
                          {status !== null && (
                            <p className={status ? 'practice-status correct' : 'practice-status incorrect'}>
                              {status ? 'Looks correct' : 'Check the key fact again'}
                            </p>
                          )}
                        </article>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <p className="card-label">What happens</p>
            <h2>What this mode copies from the real exam feeling</h2>
            <div className="plan-grid">
              <article className="info-card">
                <h3>Instruction first</h3>
                <p>You read the task before the listening starts.</p>
              </article>
              <article className="info-card">
                <h3>Short intro</h3>
                <p>The audio starts naturally, for example with `Hej` or a service opening.</p>
              </article>
              <article className="info-card">
                <h3>Small pause</h3>
                <p>A short gap makes the start feel less abrupt and more exam-like.</p>
              </article>
              <article className="info-card">
                <h3>Main message</h3>
                <p>The key facts usually come after the opening, often with the action near the end.</p>
              </article>
            </div>
            <div className="trick-box">
              <h3>How to survive this part</h3>
              <p>
                In the real exam, do not expect the answer in the first second. First understand the
                situation, then wait for the key detail, and be ready because the last sentence often
                tells you the action.
              </p>
              <p className="english-line">
                Best focus order: situation first, key fact next, action last.
              </p>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'realWritingScenario' && (
        <main className="content-grid">
          <section className="panel">
            <p className="card-label">Real writing scenario</p>
            <h2>Practice the writing part like a real exam task</h2>
            <div className="hero-actions">
              <button
                type="button"
                className={realWritingMode === 'single' ? 'primary-button' : 'secondary-button'}
                onClick={() => {
                  resetRealWritingSession(true)
                  setRealWritingMode('single')
                }}
              >
                Single writing task
              </button>
              <button
                type="button"
                className={realWritingMode === 'full' ? 'primary-button' : 'secondary-button'}
                onClick={() => {
                  resetRealWritingSession(true)
                  setRealWritingMode('full')
                }}
              >
                Full writing test mode
              </button>
            </div>
            <div className="hero-actions">
              {realWritingScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className={scenario.id === selectedRealWritingScenarioId ? 'selector active' : 'selector'}
                  onClick={() => {
                    setSelectedRealWritingScenarioId(scenario.id)
                    setRealWritingStage('ready')
                  }}
                >
                  <span>{scenario.title}</span>
                  <small>{scenario.titleSv}</small>
                </button>
              ))}
            </div>
            {realWritingMode === 'full' && (
              <div className="trick-box">
                <h3>Full writing test</h3>
                <p>
                  This mode lets you move through several real-style writing tasks in order, like a
                  mini writing exam session.
                </p>
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="card-label">Writing paper</p>
                <h2>{selectedRealWritingScenario.title}</h2>
                <p className="inline-translation">{selectedRealWritingScenario.titleSv}</p>
              </div>
              <div className="hero-actions">
                <div className="timer-chip">Stage: {realWritingFlowInfo[realWritingStage].label}</div>
                <div className="timer-chip">Target: {selectedRealWritingScenario.targetWords}</div>
                {realWritingMode === 'full' && (
                  <div className="timer-chip">
                    Task {realWritingScenarios.findIndex((item) => item.id === selectedRealWritingScenarioId) + 1}
                    /{realWritingScenarios.length}
                  </div>
                )}
              </div>
            </div>

            <div className="real-flow-grid">
              {(['ready', 'plan', 'write', 'review', 'finished'] as const).map((stageKey, index) => (
                <article
                  key={stageKey}
                  className={
                    stageKey === realWritingStage ? 'real-flow-card active' : 'real-flow-card'
                  }
                >
                  <small>Step {index + 1}</small>
                  <strong>{realWritingFlowInfo[stageKey].label}</strong>
                  <span>{realWritingFlowInfo[stageKey].sv}</span>
                </article>
              ))}
            </div>

            {realWritingMode === 'full' && (
              <div className="real-test-strip">
                {realWritingScenarios.map((scenario, index) => (
                  <article
                    key={`writing-strip-${scenario.id}`}
                    className={
                      scenario.id === selectedRealWritingScenarioId
                        ? 'real-test-card active'
                        : 'real-test-card'
                    }
                  >
                    <small>Task {index + 1}</small>
                    <strong>{scenario.title}</strong>
                    <span>{scenario.titleSv}</span>
                  </article>
                ))}
              </div>
            )}

            <div className="paper-layout">
              <div className="paper-column">
                <div className="paper-header">
                  <strong>Question paper</strong>
                  <span>Provpapper</span>
                </div>
                <div className="task-card">
                  <h3>Instruction</h3>
                  <p>{selectedRealWritingScenario.instructionSv}</p>
                  {showEnglishHelp && (
                    <>
                      <h3>English help</h3>
                      <p className="english-line">{selectedRealWritingScenario.instructionEn}</p>
                    </>
                  )}
                  <div className="exam-stage-box">
                    <h3>What is happening now</h3>
                    <div className="shortcut-sign">{realWritingFlowInfo[realWritingStage].label}</div>
                    <p>{realWritingFlowInfo[realWritingStage].description}</p>
                    <p className="english-line">{realWritingFlowInfo[realWritingStage].translation}</p>
                    <p className="topic-trick">
                      <strong>Exam trick:</strong> {realWritingFlowInfo[realWritingStage].trick}
                    </p>
                  </div>
                  <div className="trick-box">
                    <h3>Real writing flow</h3>
                    <div className="shortcut-sign">
                      Instruction {'->'} Plan {'->'} Write {'->'} Review {'->'} Finish
                    </div>
                    <p>
                      This mode copies the real writing feeling: understand the task first, make a
                      fast plan, write clearly, and leave a short moment to review.
                    </p>
                  </div>
                  <h3>Prompt in Swedish</h3>
                  <p>{selectedRealWritingScenario.promptSv}</p>
                  {showEnglishHelp && (
                    <>
                      <h3>Prompt in English</h3>
                      <p className="english-line">{selectedRealWritingScenario.promptEn}</p>
                    </>
                  )}
                  <h3>Checklist</h3>
                  <ul>
                    {selectedRealWritingScenario.checklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <h3>Phrase support</h3>
                  <div className="chips">
                    {selectedRealWritingScenario.phraseBank.map((phrase) => (
                      <span key={phrase} className="chip">
                        {phrase}
                      </span>
                    ))}
                  </div>
                  {realWritingStage === 'finished' && (
                    <div className="model-answer-box">
                      <h3>Sample answer in Swedish</h3>
                      <pre>{selectedRealWritingScenario.modelAnswerSv}</pre>
                      {showEnglishHelp && (
                        <>
                          <h3>Sample answer in English</h3>
                          <pre>{selectedRealWritingScenario.modelAnswerEn}</pre>
                        </>
                      )}
                    </div>
                  )}
                  <div className="hero-actions">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => startRealWritingScenario(selectedRealWritingScenario.id)}
                    >
                      Start writing task
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={moveRealWritingStage}
                      disabled={realWritingStage === 'finished'}
                    >
                      {realWritingStage === 'ready'
                        ? 'Move to plan'
                        : realWritingStage === 'plan'
                          ? 'Start writing'
                          : realWritingStage === 'write'
                            ? 'Move to review'
                            : 'Finish task'}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => resetRealWritingSession(true)}
                    >
                      Reset writing task
                    </button>
                    {realWritingMode === 'full' && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={moveToNextRealWritingScenario}
                      >
                        Next task
                      </button>
                    )}
                    {realWritingMode === 'full' && (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={startFullRealWritingTest}
                        disabled={fullRealWritingStarted}
                      >
                        {fullRealWritingStarted ? 'Full test active' : 'Start full writing test'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="paper-column answer-column">
                <div className="paper-header">
                  <strong>Answer sheet</strong>
                  <span>Svarspapper</span>
                </div>
                <div className="task-card">
                  <h3>Your writing</h3>
                  <textarea
                    rows={18}
                    value={
                      realWritingAnswers[selectedRealWritingScenario.id] ?? selectedRealWritingScenario.starter
                    }
                    onChange={(event) =>
                      updateRealWritingAnswer(selectedRealWritingScenario.id, event.target.value)
                    }
                  />
                  <p className="word-count">
                    Word count:{' '}
                    {(realWritingAnswers[selectedRealWritingScenario.id] ?? selectedRealWritingScenario.starter)
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'realListeningPaper' && (
        <main className="content-grid listening-paper-mode">
          <section className="panel exam-paper-topbar plain-paper-panel">
            <div className="panel-header">
              <div>
                <p className="card-label">Provlage</p>
                <h2>Horförståelse</h2>
              </div>
              <div className="hero-actions">
                <div className="timer-chip">Tid kvar: {formatSwedishTime(listeningPaperTimeLeft)}</div>
                <div className="timer-chip">Obligatoriska delar: {selectedListeningPaperExam.sections.length}</div>
                <div className="timer-chip">Aktiv del: {selectedRealScenario.titleSv}</div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setLiveCaptionMode((current) => (current === 'learning' ? 'strict' : 'learning'))
                  }
                >
                  {liveCaptionMode === 'learning' ? 'Larolage: Pa' : 'Provlage: Strikt'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setActiveTab('realListeningPaperEnglish')}
                >
                  English
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => startRealExamScenario(selectedRealScenario.id, 'single')}
                  disabled={(realExamPlayCounts[selectedRealScenario.id] ?? 0) >= 2}
                >
                  {(realExamPlayCounts[selectedRealScenario.id] ?? 0) >= 2
                    ? 'Inga spelningar kvar'
                    : 'Starta ljud'}
                </button>
                <button type="button" className="secondary-button" onClick={stopAudio}>
                  Stoppa ljud
                </button>
                <button type="button" className="secondary-button" onClick={toggleExamFullscreen}>
                  {isFullscreenExam ? 'Avsluta helskarm' : 'Helskarm'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setListeningPaperTimeLeft(20 * 60)}
                >
                  Ny tid
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    stopAudio()
                    setActiveTab('realExamScenario')
                  }}
                >
                  Lamna provlage
                </button>
                {selectedListeningPaperExam.sections.map((section, index) => (
                  <button
                    key={`active-listen-${section.id}`}
                    type="button"
                    className={section.id === selectedRealScenarioId ? 'primary-button' : 'secondary-button'}
                    onClick={() => setSelectedRealScenarioId(section.id)}
                  >
                    Del {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="panel plain-paper-panel">
            <div className="official-sheet-header">
              <div className="official-koke-row">
                <span>Koe / Testi</span>
                <span>Yleiset kielitutkinnot</span>
                <span>Svenska</span>
              </div>
              <h2>Horforstaelse - Prov 1</h2>
              <div className="sheet-meta-grid">
                <div className="sheet-meta-item">Niva: B1-fokus (medborgarskap)</div>
                <div className="sheet-meta-item">Del: Horforstaelse</div>
                <div className="sheet-meta-item">Tid: 20 minuter</div>
                <div className="sheet-meta-item">Obligatoriskt: Del 1, Del 2, Del 3</div>
              </div>
            </div>
            <div className="candidate-row">
              <label className="candidate-field">
                <span>Namn</span>
                <input
                  type="text"
                  value={listeningCandidateInfo.namn}
                  onChange={(event) =>
                    setListeningCandidateInfo((current) => ({ ...current, namn: event.target.value }))
                  }
                />
              </label>
              <label className="candidate-field">
                <span>Datum</span>
                <input
                  type="date"
                  value={listeningCandidateInfo.datum}
                  onChange={(event) =>
                    setListeningCandidateInfo((current) => ({ ...current, datum: event.target.value }))
                  }
                />
              </label>
              <label className="candidate-field">
                <span>Personnummer</span>
                <input
                  type="text"
                  value={listeningCandidateInfo.personnummer}
                  onChange={(event) =>
                    setListeningCandidateInfo((current) => ({
                      ...current,
                      personnummer: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="task-card plain-task-card">
              <p>
                Las instruktionerna noggrant. Svara pa alla delar. Fokus ar tydlig och enkel
                svenska pa B1-niva. Transkript ar inte tillgangligt i provlage.
              </p>
            </div>
            <div className="paper-audio-cta">
              <button
                type="button"
                className="primary-button paper-play-button"
                onClick={() => startRealExamScenario(selectedRealScenario.id, 'single')}
                disabled={(realExamPlayCounts[selectedRealScenario.id] ?? 0) >= 2}
              >
                {(realExamPlayCounts[selectedRealScenario.id] ?? 0) >= 2
                  ? 'Inga spelningar kvar'
                  : 'Starta ljud nu'}
              </button>
            </div>

            <div className="paper-layout">
              <div className="paper-column">
                <div className="paper-header">
                  <strong>Provpapper</strong>
                  <span>Horförståelse</span>
                </div>
                <div className="paper-question-list">
                  {selectedListeningPaperExam.sections.map((section, sectionIndex) => (
                    <article key={`listen-section-${section.id}`} className="task-card plain-task-card">
                      <h3>Del {sectionIndex + 1}</h3>
                      <p>{section.instructionSv}</p>
                      <p className="plain-exam-note">Spelningar: {realExamPlayCounts[section.id] ?? 0}/2</p>
                      <div className="paper-question-list">
                        {section.questions.map((question, index) => (
                          <article key={`paper-q-${question.id}`} className="question-card">
                            <strong>
                              Fraga {sectionIndex + 1}.{index + 1}
                            </strong>
                            <p>{question.prompt}</p>
                            {(question.options ?? []).length > 0 && (
                              <ol className="paper-options" type="A">
                                {(question.options ?? []).map((option) => (
                                  <li key={option}>
                                    <span>{option}</span>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </article>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="paper-column answer-column">
                <div className="paper-header">
                  <strong>Svarspapper</strong>
                  <span>Horförståelse</span>
                </div>
                <article className="task-card plain-task-card live-caption-card">
                  <h3>Live text (svenska + English)</h3>
                  <p className="plain-exam-note">
                    {isRealExamAudioRunning
                      ? 'Live text visas medan ljudet spelas (intro + huvuddel).'
                      : liveCaptionMode === 'learning'
                        ? 'Ljudet ar stoppat. Senast spelade rader visas.'
                        : 'Tryck Starta ljud for realtidsvisning.'}
                  </p>
                  {showLiveCaptionsNow && (
                    <div ref={realCaptionContainerRef} className="caption-lines">
                      {liveCaptionLines
                        .filter((_, index) =>
                          liveCaptionMode === 'strict'
                            ? index === liveCaptionIndex
                            : index < liveCaptionHeardCount,
                        )
                        .map((line, index) => (
                        <article
                          key={`live-caption-sv-${line.sv}-${index}`}
                          className={
                            liveCaptionMode === 'strict' || index === liveCaptionIndex
                              ? 'caption-line active'
                              : 'caption-line heard'
                          }
                        >
                          <p>{line.sv}</p>
                          <p className="english-line">{line.en}</p>
                          {liveCaptionMode === 'learning' && (
                            <div className="caption-actions">
                              <button
                                type="button"
                                className="secondary-button compact-button"
                                onClick={() => replayLiveCaptionLine(line.sv)}
                                disabled={isRealExamAudioRunning}
                              >
                                Spela igen langsamt
                              </button>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                  {!showLiveCaptionsNow && (
                    <div className="caption-empty">Ingen live-text just nu.</div>
                  )}
                </article>
                <div className="question-grid answer-grid">
                  {selectedListeningPaperExam.sections.flatMap((section, sectionIndex) =>
                    section.questions.map((question, index) => (
                      <article key={`paper-a-${question.id}`} className="question-card plain-task-card">
                        <strong>
                          Svar {sectionIndex + 1}.{index + 1}
                        </strong>
                        {(question.type === 'mcq' || question.type === 'boolean') && (
                          <div className="option-list">
                            {(question.options ?? []).map((option) => (
                              <label key={option} className="option-item">
                                <input
                                  type="radio"
                                  name={`paper-${question.id}`}
                                  value={option}
                                  checked={(realExamAnswers[question.id] ?? '') === option}
                                  onChange={(event) => updateRealExamAnswer(question.id, event.target.value)}
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {question.type === 'short' && (
                          <textarea
                            rows={3}
                            value={realExamAnswers[question.id] ?? ''}
                            onChange={(event) => updateRealExamAnswer(question.id, event.target.value)}
                            placeholder="Skriv ett kort svar"
                          />
                        )}
                      </article>
                    )),
                  )}
                </div>
              </div>
            </div>
          </section>
          <section className="sticky-audio-bar">
            <div className="sticky-audio-content">
              <strong>Ljudkontroll</strong>
              <span>Aktiv del: {selectedRealScenario.titleSv}</span>
            </div>
            <div className="hero-actions compact-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => startRealExamScenario(selectedRealScenario.id, 'single')}
                disabled={(realExamPlayCounts[selectedRealScenario.id] ?? 0) >= 2}
              >
                Starta ljud
              </button>
              <button type="button" className="secondary-button" onClick={stopAudio}>
                Stoppa ljud
              </button>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'realListeningPaperEnglish' && (
        <main className="content-grid listening-paper-mode english-paper-mode">
          <section className="panel exam-paper-topbar plain-paper-panel">
            <div className="panel-header">
              <div>
                <p className="card-label">Exam mode</p>
                <h2>Listening test</h2>
              </div>
              <div className="hero-actions">
                <div className="timer-chip">Time left: {formatSwedishTime(listeningPaperTimeLeft)}</div>
                <div className="timer-chip">
                  Required parts: {selectedListeningPaperExam.sections.length}
                </div>
                <div className="timer-chip">Active part: {selectedRealScenario.title}</div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setLiveCaptionMode((current) => (current === 'learning' ? 'strict' : 'learning'))
                  }
                >
                  {liveCaptionMode === 'learning' ? 'Learning mode: ON' : 'Exam strict mode'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setActiveTab('realListeningPaper')}
                >
                  Svenska
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => startRealExamScenario(selectedRealScenario.id, 'single')}
                  disabled={(realExamPlayCounts[selectedRealScenario.id] ?? 0) >= 2}
                >
                  {(realExamPlayCounts[selectedRealScenario.id] ?? 0) >= 2
                    ? 'No plays left'
                    : 'Start audio'}
                </button>
                <button type="button" className="secondary-button" onClick={stopAudio}>
                  Stop audio
                </button>
                <button type="button" className="secondary-button" onClick={toggleExamFullscreen}>
                  {isFullscreenExam ? 'Exit fullscreen' : 'Fullscreen'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setListeningPaperTimeLeft(20 * 60)}
                >
                  Reset time
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    stopAudio()
                    setActiveTab('realListeningPaper')
                  }}
                >
                  Back to Swedish paper
                </button>
                {selectedListeningPaperExam.sections.map((section, index) => (
                  <button
                    key={`active-listen-en-${section.id}`}
                    type="button"
                    className={section.id === selectedRealScenarioId ? 'primary-button' : 'secondary-button'}
                    onClick={() => setSelectedRealScenarioId(section.id)}
                  >
                    Part {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="panel plain-paper-panel">
            <div className="official-sheet-header">
              <div className="official-koke-row">
                <span>Exam / Test</span>
                <span>National Language Certificates</span>
                <span>Swedish</span>
              </div>
              <h2>Listening Comprehension - Paper 1 (English Version)</h2>
              <div className="sheet-meta-grid">
                <div className="sheet-meta-item">Level: B1 focus (citizenship goal)</div>
                <div className="sheet-meta-item">Section: Listening</div>
                <div className="sheet-meta-item">Time: 20 minutes</div>
                <div className="sheet-meta-item">Required: Part 1, Part 2, Part 3</div>
              </div>
            </div>
            <div className="candidate-row">
              <label className="candidate-field">
                <span>Name</span>
                <input
                  type="text"
                  value={listeningCandidateInfo.namn}
                  onChange={(event) =>
                    setListeningCandidateInfo((current) => ({ ...current, namn: event.target.value }))
                  }
                />
              </label>
              <label className="candidate-field">
                <span>Date</span>
                <input
                  type="date"
                  value={listeningCandidateInfo.datum}
                  onChange={(event) =>
                    setListeningCandidateInfo((current) => ({ ...current, datum: event.target.value }))
                  }
                />
              </label>
              <label className="candidate-field">
                <span>Personal ID</span>
                <input
                  type="text"
                  value={listeningCandidateInfo.personnummer}
                  onChange={(event) =>
                    setListeningCandidateInfo((current) => ({
                      ...current,
                      personnummer: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="task-card plain-task-card">
              <p>
                Read the instructions carefully. Answer all parts. Focus on clear, simple B1
                Swedish. Transcript is not available in exam mode.
              </p>
            </div>
            <div className="paper-audio-cta">
              <button
                type="button"
                className="primary-button paper-play-button"
                onClick={() => startRealExamScenario(selectedRealScenario.id, 'single')}
                disabled={(realExamPlayCounts[selectedRealScenario.id] ?? 0) >= 2}
              >
                {(realExamPlayCounts[selectedRealScenario.id] ?? 0) >= 2
                  ? 'No plays left'
                  : 'Start audio now'}
              </button>
            </div>

            <div className="paper-layout">
              <div className="paper-column">
                <div className="paper-header">
                  <strong>Question paper</strong>
                  <span>Listening test</span>
                </div>
                <div className="paper-question-list">
                  {selectedListeningPaperExam.sections.map((section, sectionIndex) => (
                    <article key={`listen-en-section-${section.id}`} className="task-card plain-task-card">
                      <h3>Part {sectionIndex + 1}</h3>
                      <p>{section.instructionEn}</p>
                      <p className="plain-exam-note">Plays used: {realExamPlayCounts[section.id] ?? 0}/2</p>
                      <div className="paper-question-list">
                        {section.questions.map((question, index) => (
                          <article key={`paper-en-q-${question.id}`} className="question-card">
                            <strong>
                              Question {sectionIndex + 1}.{index + 1}
                            </strong>
                            <p>{translateToEnglish(question.prompt)}</p>
                            {(question.options ?? []).length > 0 && (
                              <ol className="paper-options" type="A">
                                {(question.options ?? []).map((option) => (
                                  <li key={option}>
                                    <span>{translateToEnglish(option)}</span>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </article>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="paper-column answer-column">
                <div className="paper-header">
                  <strong>Answer sheet</strong>
                  <span>Listening test</span>
                </div>
                <article className="task-card plain-task-card live-caption-card">
                  <h3>Live speech text (Swedish + English)</h3>
                  <p className="plain-exam-note">
                    {isRealExamAudioRunning
                      ? 'Live text is shown while audio is running (intro + main).'
                      : liveCaptionMode === 'learning'
                        ? 'Audio is stopped. Last played lines are visible.'
                        : 'Press Start audio to show real-time lines.'}
                  </p>
                  {showLiveCaptionsNow && (
                    <div ref={realCaptionContainerRef} className="caption-lines">
                      {liveCaptionLines
                        .filter((_, index) =>
                          liveCaptionMode === 'strict'
                            ? index === liveCaptionIndex
                            : index < liveCaptionHeardCount,
                        )
                        .map((line, index) => (
                        <article
                          key={`live-caption-en-${line.sv}-${index}`}
                          className={
                            liveCaptionMode === 'strict' || index === liveCaptionIndex
                              ? 'caption-line active'
                              : 'caption-line heard'
                          }
                        >
                          <p>{line.sv}</p>
                          <p className="english-line">{line.en}</p>
                          {liveCaptionMode === 'learning' && (
                            <div className="caption-actions">
                              <button
                                type="button"
                                className="secondary-button compact-button"
                                onClick={() => replayLiveCaptionLine(line.sv)}
                                disabled={isRealExamAudioRunning}
                              >
                                Replay slowly
                              </button>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                  {!showLiveCaptionsNow && (
                    <div className="caption-empty">No live lines right now.</div>
                  )}
                </article>
                <div className="question-grid answer-grid">
                  {selectedListeningPaperExam.sections.flatMap((section, sectionIndex) =>
                    section.questions.map((question, index) => (
                      <article key={`paper-en-a-${question.id}`} className="question-card plain-task-card">
                        <strong>
                          Answer {sectionIndex + 1}.{index + 1}
                        </strong>
                        {(question.type === 'mcq' || question.type === 'boolean') && (
                          <div className="option-list">
                            {(question.options ?? []).map((option) => (
                              <label key={option} className="option-item">
                                <input
                                  type="radio"
                                  name={`paper-en-${question.id}`}
                                  value={option}
                                  checked={(realExamAnswers[question.id] ?? '') === option}
                                  onChange={(event) => updateRealExamAnswer(question.id, event.target.value)}
                                />
                                <span>{translateToEnglish(option)}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {question.type === 'short' && (
                          <textarea
                            rows={3}
                            value={realExamAnswers[question.id] ?? ''}
                            onChange={(event) => updateRealExamAnswer(question.id, event.target.value)}
                            placeholder="Write a short answer"
                          />
                        )}
                      </article>
                    )),
                  )}
                </div>
              </div>
            </div>
          </section>
          <section className="sticky-audio-bar">
            <div className="sticky-audio-content">
              <strong>Audio control</strong>
              <span>Current part: {selectedRealScenario.title}</span>
            </div>
            <div className="hero-actions compact-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => startRealExamScenario(selectedRealScenario.id, 'single')}
                disabled={(realExamPlayCounts[selectedRealScenario.id] ?? 0) >= 2}
              >
                Start audio
              </button>
              <button type="button" className="secondary-button" onClick={stopAudio}>
                Stop audio
              </button>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'realWritingPaper' && (
        <main className="content-grid writing-paper-mode">
          <section className="panel exam-paper-topbar plain-paper-panel">
            <div className="panel-header">
              <div>
                <p className="card-label">Provlage</p>
                <h2>Skrivprov</h2>
              </div>
              <div className="hero-actions">
                <div className="timer-chip">Tid kvar: {formatSwedishTime(writingPaperTimeLeft)}</div>
                <div className="timer-chip">Obligatoriska uppgifter: 2</div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setActiveTab('realWritingPaperEnglish')}
                >
                  English
                </button>
                <button type="button" className="secondary-button" onClick={toggleExamFullscreen}>
                  {isFullscreenExam ? 'Avsluta helskarm' : 'Helskarm'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setWritingPaperTimeLeft(55 * 60)}
                >
                  Ny tid
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setActiveTab('realWritingScenario')}
                >
                  Lamna provlage
                </button>
              </div>
            </div>
          </section>

          <section className="panel plain-paper-panel">
            <div className="official-sheet-header">
              <div className="official-koke-row">
                <span>Koe / Testi</span>
                <span>Yleiset kielitutkinnot</span>
                <span>Svenska</span>
              </div>
              <h2>Skriftlig fardighet - Prov 1</h2>
              <div className="sheet-meta-grid">
                <div className="sheet-meta-item">Niva: B1-fokus (medborgarskap)</div>
                <div className="sheet-meta-item">Del: Skriva</div>
                <div className="sheet-meta-item">Tid: 55 minuter</div>
                <div className="sheet-meta-item">Obligatoriskt: Uppgift 1 och 2</div>
              </div>
            </div>
            <div className="candidate-row">
              <label className="candidate-field">
                <span>Namn</span>
                <input
                  type="text"
                  value={writingCandidateInfo.namn}
                  onChange={(event) =>
                    setWritingCandidateInfo((current) => ({ ...current, namn: event.target.value }))
                  }
                />
              </label>
              <label className="candidate-field">
                <span>Datum</span>
                <input
                  type="date"
                  value={writingCandidateInfo.datum}
                  onChange={(event) =>
                    setWritingCandidateInfo((current) => ({ ...current, datum: event.target.value }))
                  }
                />
              </label>
              <label className="candidate-field">
                <span>Personnummer</span>
                <input
                  type="text"
                  value={writingCandidateInfo.personnummer}
                  onChange={(event) =>
                    setWritingCandidateInfo((current) => ({
                      ...current,
                      personnummer: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="task-card plain-task-card">
              <p>
                Las instruktionerna noggrant. Svara pa bada uppgifterna. Hall dig till amnet,
                anvand enkel B1-svenska och se till att alla delmoment finns med i svaret.
              </p>
            </div>

            <div className="paper-layout">
              <div className="paper-column">
                <div className="paper-header">
                  <strong>Provpapper</strong>
                  <span>Skrivprov</span>
                </div>
                {selectedWritingPaperExam.tasks.map((task, index) => (
                  <article key={`writing-task-${task.id}`} className="task-card plain-task-card">
                    <h3>Uppgift {index + 1} (obligatorisk)</h3>
                    <p className="card-label">{formatTargetWordsSv(task.targetWords)}</p>
                    <p className="plain-exam-note">
                      Typ: {task.pattern === 'Practical message' ? 'Praktiskt meddelande' : 'Asiktstext'}
                    </p>
                    <p>{task.instructionSv}</p>
                    <p className="instruction">{task.promptSv}</p>
                    <p className="plain-exam-note">Det ska framga i texten:</p>
                    <ul>
                      {task.checklist.map((item) => (
                        <li key={`${task.id}-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <div className="paper-column answer-column">
                <div className="paper-header">
                  <strong>Svarspapper</strong>
                  <span>Skrivprov</span>
                </div>
                {selectedWritingPaperExam.tasks.map((task, index) => (
                  <article key={`writing-answer-${task.id}`} className="task-card plain-task-card answer-page">
                    <h3>Svar uppgift {index + 1}</h3>
                    <p className="card-label">{formatTargetWordsSv(task.targetWords)}</p>
                    <textarea
                      className="lined-answer"
                      rows={14}
                      value={realWritingAnswers[task.id] ?? task.starter}
                      onChange={(event) => updateRealWritingAnswer(task.id, event.target.value)}
                    />
                    <div className="signature-row">
                      <span>Underskrift</span>
                      <div className="signature-line" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'realWritingPaperEnglish' && (
        <main className="content-grid writing-paper-mode english-paper-mode">
          <section className="panel exam-paper-topbar plain-paper-panel">
            <div className="panel-header">
              <div>
                <p className="card-label">Exam mode</p>
                <h2>Writing test</h2>
              </div>
              <div className="hero-actions">
                <div className="timer-chip">Time left: {formatSwedishTime(writingPaperTimeLeft)}</div>
                <div className="timer-chip">Required tasks: 2</div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setActiveTab('realWritingPaper')}
                >
                  Svenska
                </button>
                <button type="button" className="secondary-button" onClick={toggleExamFullscreen}>
                  {isFullscreenExam ? 'Exit fullscreen' : 'Fullscreen'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setWritingPaperTimeLeft(55 * 60)}
                >
                  Reset time
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setActiveTab('realWritingPaper')}
                >
                  Back to Swedish paper
                </button>
              </div>
            </div>
          </section>

          <section className="panel plain-paper-panel">
            <div className="official-sheet-header">
              <div className="official-koke-row">
                <span>Exam / Test</span>
                <span>National Language Certificates</span>
                <span>Swedish</span>
              </div>
              <h2>Writing Skills - Paper 1 (English Version)</h2>
              <div className="sheet-meta-grid">
                <div className="sheet-meta-item">Level: B1 focus (citizenship goal)</div>
                <div className="sheet-meta-item">Section: Writing</div>
                <div className="sheet-meta-item">Time: 55 minutes</div>
                <div className="sheet-meta-item">Required: Task 1 and Task 2</div>
              </div>
            </div>
            <div className="candidate-row">
              <label className="candidate-field">
                <span>Name</span>
                <input
                  type="text"
                  value={writingCandidateInfo.namn}
                  onChange={(event) =>
                    setWritingCandidateInfo((current) => ({ ...current, namn: event.target.value }))
                  }
                />
              </label>
              <label className="candidate-field">
                <span>Date</span>
                <input
                  type="date"
                  value={writingCandidateInfo.datum}
                  onChange={(event) =>
                    setWritingCandidateInfo((current) => ({ ...current, datum: event.target.value }))
                  }
                />
              </label>
              <label className="candidate-field">
                <span>Personal ID</span>
                <input
                  type="text"
                  value={writingCandidateInfo.personnummer}
                  onChange={(event) =>
                    setWritingCandidateInfo((current) => ({
                      ...current,
                      personnummer: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="task-card plain-task-card">
              <p>
                Read the instructions carefully. Answer both tasks. Stay on topic, use clear B1
                Swedish, and include all task points in your answer.
              </p>
            </div>

            <div className="paper-layout">
              <div className="paper-column">
                <div className="paper-header">
                  <strong>Question paper</strong>
                  <span>Writing test</span>
                </div>
                {selectedWritingPaperExam.tasks.map((task, index) => (
                  <article key={`writing-task-en-${task.id}`} className="task-card plain-task-card">
                    <h3>Task {index + 1} (required)</h3>
                    <p className="card-label">{task.targetWords}</p>
                    <p className="plain-exam-note">
                      Type: {task.pattern === 'Practical message' ? 'Practical message' : 'Opinion text'}
                    </p>
                    <p>{task.instructionEn}</p>
                    <p className="instruction">{task.promptEn}</p>
                    <p className="plain-exam-note">Your text must include:</p>
                    <ul>
                      {task.checklist.map((item) => (
                        <li key={`en-${task.id}-${item}`}>{translateWritingChecklistItem(item)}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <div className="paper-column answer-column">
                <div className="paper-header">
                  <strong>Answer sheet</strong>
                  <span>Writing test</span>
                </div>
                {selectedWritingPaperExam.tasks.map((task, index) => (
                  <article key={`writing-answer-en-${task.id}`} className="task-card plain-task-card answer-page">
                    <h3>Answer task {index + 1}</h3>
                    <p className="card-label">{task.targetWords}</p>
                    <textarea
                      className="lined-answer"
                      rows={14}
                      value={realWritingAnswers[task.id] ?? task.starter}
                      onChange={(event) => updateRealWritingAnswer(task.id, event.target.value)}
                    />
                    <div className="signature-row">
                      <span>Signature</span>
                      <div className="signature-line" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'resources' && (
        <main className="content-grid">
          <section className="panel">
            <p className="card-label">60-day preparation</p>
            <h2>Simple plan for the next 60 days</h2>
            <div className="plan-grid">
              {sixtyDayPlan.map((block) => (
                <article key={block.title} className="info-card">
                  <h3>{block.title}</h3>
                  <p>{block.focus}</p>
                  <ul>
                    {block.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="card-label">Trusted practice sources</p>
            <h2>Use these with the mock exams</h2>
            <ul className="steps">
              {officialYkiNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <div className="resource-list">
              {resources.map((resource) => (
                <a
                  key={resource.url}
                  className="resource-card"
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <strong>{resource.title}</strong>
                  <p>{resource.description}</p>
                  <span>Open resource</span>
                </a>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="card-label">Important writing topics</p>
            <h2>Practice these topics again and again</h2>
            <div className="plan-grid">
              {writingTopicPractice.map((group) => (
                <article key={group.title} className="info-card">
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="card-label">Daily drill</p>
            <h2>Best use of this website</h2>
            <ol className="steps">
              <li>Take one full mock exam on this site.</li>
              <li>Use `Yle lätt svenska` for one extra listening clip on the same day.</li>
              <li>Write one short summary and one practical email.</li>
              <li>Review the topic map before your next exam.</li>
            </ol>
          </section>

          <section className="panel">
            <p className="card-label">Listening tricks</p>
            <h2>How to understand listening faster</h2>
            <div className="plan-grid">
              {listeningShortcutTips.map((tip) => (
                <article key={tip.title} className="info-card">
                  <h3>{tip.title}</h3>
                  <div className="shortcut-sign">{tip.sign}</div>
                  <p>{tip.explanation}</p>
                </article>
              ))}
            </div>
            <ul className="steps remember-list">
              {listeningAlwaysRemember.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <p className="card-label">Listening topics</p>
            <h2>Top topics to understand in the exam hall</h2>
            <div className="chips">
              {listeningTopicList.map((topic) => (
                <span key={topic} className="chip">
                  {topic}
                </span>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="card-label">Best practice loop</p>
            <h2>How to practise writing best</h2>
            <ol className="steps">
              {bestPracticeLoop.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="panel">
            <p className="card-label">Writing practice method</p>
            <h2>Best way to improve writing with resources</h2>
            <ol className="steps">
              {writingResourceWorkflow.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="panel">
            <p className="card-label">Always remember</p>
            <h2>Useful tricks so you do not memorize everything</h2>
            <div className="plan-grid">
              {writingShortcutTips.map((tip) => (
                <article key={tip.title} className="info-card">
                  <h3>{tip.title}</h3>
                  <div className="shortcut-sign">{tip.sign}</div>
                  <p>{tip.explanation}</p>
                </article>
              ))}
            </div>
            <ul className="steps remember-list">
              {alwaysRememberList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <p className="card-label">Core phrases</p>
            <h2>Remember these few phrases only</h2>
            <div className="phrase-guide-list">
              {phraseBank.map((phrase) => (
                <article key={`resource-${phrase}`} className="phrase-guide-card">
                  <strong>{phrase}</strong>
                  <p className="english-line">{phraseGuide[phrase]?.english}</p>
                  <p>{phraseGuide[phrase]?.why}</p>
                  <small>Memory sign: {phraseGuide[phrase]?.memory}</small>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  )
}

export default App
