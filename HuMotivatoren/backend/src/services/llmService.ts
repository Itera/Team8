import axios from 'axios';
import type { MotivationRequest, MotivationResponse } from '../types/index.js';

const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;
const AZURE_API_VERSION = process.env.AZURE_OPENAI_API_VERSION;
const AZURE_API_KEY = process.env.AZURE_OPENAI_API_KEY;

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

async function generateWithLLM(task: string, personality: string): Promise<MotivationResponse> {
  const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

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
        'api-key': AZURE_API_KEY,
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

export async function getMotivation(request: MotivationRequest): Promise<MotivationResponse> {
  const personality = request.personality || 'silly';

  if (!AZURE_ENDPOINT || !AZURE_DEPLOYMENT || !AZURE_API_VERSION || !AZURE_API_KEY) {
    console.warn('⚠️ Azure OpenAI not configured — returning fallback response');
    return { ...fallbackResponses[personality] ?? fallbackResponses.silly };
  }

  try {
    return await generateWithLLM(request.task, personality);
  } catch (error) {
    console.error('LLM call failed, using fallback:', error instanceof Error ? error.message : error);
    return { ...fallbackResponses[personality] ?? fallbackResponses.silly };
  }
}
