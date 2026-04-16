import axios from 'axios';
import type { MotivationRequest, MotivationResponse } from '../types/index.js';

interface DevelopmentHistoryMarkdownInput {
  hash: string;
  title: string;
  date: string;
  author: string;
  body?: string;
  files?: string[];
}

const personalityDescriptions: Record<string, string> = {
  silly:   'useriøs, morsom og litt fjollete. Bruk humor, ordspill og morsomme fakta.',
  serious: 'seriøs, motiverende og profesjonell. Bruk inspirerende sitater og faktabaserte tips.',
  sports:  'sports-entusiastisk med sportsmetaforer og sportsfakta. Tenk som en trener.',
  nerdy:   'nerdete, tech-interessert og full av referanser til programmering, sci-fi og teknologi.',
};

const personalityEmojis: Record<string, string> = {
  silly:   '😜',
  serious: '🎯',
  sports:  '⚽',
  nerdy:   '🤓',
};

const fallbackResponses: Record<string, MotivationResponse> = {
  silly: {
    quote: "Hvorfor gjøre i dag det du kan utsette til i morgen? ...Bare tuller, kom igjen! 💪",
    fact: "Visste du at en gjennomsnittlig person bruker 6 måneder av livet sitt på å vente på rødt lys?",
    tip: "Prøv å gjøre oppgaven mens du lytter til episk musikk. Virker alltid!",
    gifUrl: "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
    emoji: "😜",
    personality: "silly"
  },
  serious: {
    quote: "Suksess er summen av små anstrengelser, gjentatt dag etter dag. – Robert Collier",
    fact: "Studier viser at å skrive ned målene dine øker sjansen for å oppnå dem med 42%.",
    tip: "Del oppgaven i mindre deler og feir hver milepæl.",
    gifUrl: "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif",
    emoji: "🎯",
    personality: "serious"
  },
  sports: {
    quote: "Du bommer på 100% av skuddene du ikke tar. – Wayne Gretzky",
    fact: "Den raskeste målscoringen i fotball-VM tok bare 10.8 sekunder!",
    tip: "Tenk på oppgaven som en kamp. Oppvarming først, så full innsats!",
    gifUrl: "https://media.giphy.com/media/l0MYH8Q83CXvKzXyM/giphy.gif",
    emoji: "⚽",
    personality: "sports"
  },
  nerdy: {
    quote: "Det er ikke en bug, det er en feature i livet ditt.",
    fact: "Den første datamaskinen veide over 27 tonn og tok opp et helt rom.",
    tip: "Rubber duck debugging fungerer også på livsproblemer. Forklar oppgaven til en gummiand!",
    gifUrl: "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif",
    emoji: "🤓",
    personality: "nerdy"
  }
};

const disallowedContentPattern = /\b(hat|rasist|naz|sex|porn|kill|drep|voldtekt)\b/i;

function toIsoDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }

  return parsed.toISOString().slice(0, 10);
}

function stripCodeFence(content: string): string {
  return content.trim().replace(/^```(?:markdown|md)?\s*/i, '').replace(/\s*```$/i, '');
}

function truncate(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function sanitizeFiles(files: string[]): string[] {
  return files
    .map((file) => file.trim())
    .filter((file) => file.length > 0)
    .slice(0, 20);
}

function deterministicDevelopmentHistoryMarkdown(
  input: DevelopmentHistoryMarkdownInput,
): string {
  const body = truncate(input.body ?? '', 700);
  const files = sanitizeFiles(input.files ?? []);
  const filesSection =
    files.length > 0
      ? files.map((file) => `- \`${file}\``).join('\n')
      : '- Ingen filstier registrert for denne commiten i prosjektet.';

  const summaryLine = body.length > 0
    ? body
    : 'Ingen commit-beskrivelse utover tittelen. Se commit diff for detaljer.';

  return [
    `# ${input.title}`,
    '',
    `**Hash:** ${input.hash}`,
    `**Date:** ${toIsoDate(input.date)}`,
    `**Author:** ${input.author}`,
    '',
    '## Sammendrag',
    '',
    summaryLine,
    '',
    '## Berorte filer',
    '',
    filesSection,
    '',
    '## Kilde',
    '',
    `Basert pa ekte git commit-metadata for \`${input.hash}\`.`,
    '',
  ].join('\n');
}

function isSafeMarkdownContent(markdown: string): boolean {
  if (markdown.trim().length === 0) {
    return false;
  }

  if (markdown.length > 10000) {
    return false;
  }

  return !disallowedContentPattern.test(markdown);
}

async function generateWithLLM(
  task: string,
  personality: string,
  config: { endpoint: string; deployment: string; apiVersion: string; apiKey: string }
): Promise<MotivationResponse> {
  const url = `${config.endpoint}/openai/deployments/${config.deployment}/chat/completions?api-version=${config.apiVersion}`;

  const systemPrompt = `Du er HuMotivatoren, en norsk motivasjonsassistent som er ${personalityDescriptions[personality] || personalityDescriptions.silly}
Innholdet skal alltid være positivt, inkluderende og i tråd med Iteras verdier. Ingen støtende, diskriminerende eller upassende innhold.
Svar KUN med gyldig JSON — ingen markdown, ingen forklaringer utenfor JSON-blokken.`;

  const userPrompt = `Brukeren skal gjøre følgende oppgave: "${task}"

Generer motivasjonsinnhold på norsk tilpasset denne oppgaven. Svar med dette JSON-formatet:
{
  "quote": "Et sitat eller motiverende setning som passer til oppgaven og personality",
  "fact": "En interessant (eller useriøs) fakta relatert til oppgaven eller temaet",
  "tip": "Et konkret tips for å gjennomføre oppgaven, i tråd med personality",
  "emoji": "Et passende emoji-tegn"
}`;

  const response = await axios.post(
    url,
    {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 400,
      temperature: personality === 'serious' ? 0.5 : 0.9,
    },
    {
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );

  const content = response.data.choices?.[0]?.message?.content ?? '';
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const parsed = JSON.parse(cleaned);

  return {
    quote: parsed.quote ?? '',
    fact: parsed.fact ?? '',
    tip: parsed.tip ?? '',
    emoji: parsed.emoji ?? personalityEmojis[personality] ?? '✨',
    personality,
    gifUrl: fallbackResponses[personality]?.gifUrl,
  };
}

async function generateDevelopmentHistoryWithLLM(
  input: DevelopmentHistoryMarkdownInput,
  config: { endpoint: string; deployment: string; apiVersion: string; apiKey: string },
): Promise<string> {
  const url = `${config.endpoint}/openai/deployments/${config.deployment}/chat/completions?api-version=${config.apiVersion}`;
  const files = sanitizeFiles(input.files ?? []);

  const systemPrompt = [
    'Du lager markdown for utviklingshistorikk i et norsk prosjekt.',
    'Innholdet skal vere positivt, inkluderende og i trad med Iteras verdier.',
    'Ingen stotende, diskriminerende eller upassende innhold.',
    'Svar kun med markdown, uten kodeblokker rundt svaret.',
  ].join(' ');

  const userPrompt = [
    'Lag en kort, konkret markdown-endringslogg basert pa ekte commit metadata.',
    `Hash: ${input.hash}`,
    `Tittel: ${input.title}`,
    `Dato: ${toIsoDate(input.date)}`,
    `Forfatter: ${input.author}`,
    `Commit body: ${(input.body ?? '').trim() || 'Ingen body tilgjengelig.'}`,
    `Berorte filer: ${files.length > 0 ? files.join(', ') : 'ingen registrert'}`,
    'Struktur: # tittel, metadatafelter, seksjon for sammendrag, seksjon for berorte filer.',
    'Hold teksten under 300 ord.',
  ].join('\n');

  const response = await axios.post(
    url,
    {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 700,
      temperature: 0.2,
    },
    {
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    },
  );

  const content = response.data.choices?.[0]?.message?.content ?? '';
  return stripCodeFence(content);
}

export async function getMotivation(request: MotivationRequest): Promise<MotivationResponse> {
  const personality = request.personality || 'silly';

  // Read env vars at call time (not module load time) to avoid ESM hoisting issue
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  if (!endpoint || !deployment || !apiVersion || !apiKey) {
    console.warn('⚠️ Azure OpenAI not configured — returning fallback response');
    return { ...fallbackResponses[personality] ?? fallbackResponses.silly };
  }

  try {
    return await generateWithLLM(request.task, personality, { endpoint, deployment, apiVersion, apiKey });
  } catch (error) {
    console.error('LLM call failed, using fallback:', error instanceof Error ? error.message : error);
    return { ...fallbackResponses[personality] ?? fallbackResponses.silly };
  }
}

export async function generateDevelopmentHistoryMarkdown(
  input: DevelopmentHistoryMarkdownInput,
): Promise<string> {
  const deterministicFallback = deterministicDevelopmentHistoryMarkdown(input);

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  if (!endpoint || !deployment || !apiVersion || !apiKey) {
    return deterministicFallback;
  }

  try {
    const generated = await generateDevelopmentHistoryWithLLM(input, {
      endpoint,
      deployment,
      apiVersion,
      apiKey,
    });

    if (!isSafeMarkdownContent(generated)) {
      return deterministicFallback;
    }

    return generated;
  } catch (error) {
    console.error(
      'Development-history markdown generation failed, using fallback:',
      error instanceof Error ? error.message : error,
    );
    return deterministicFallback;
  }
}
