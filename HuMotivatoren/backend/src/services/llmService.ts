import type { MotivationRequest, MotivationResponse } from '../types/index.js';

/**
 * LLM Integration Point
 * 
 * This service will integrate with an LLM API (e.g., OpenAI, Azure OpenAI, Anthropic)
 * to generate contextual, humorous, and motivating content based on the user's task.
 * 
 * TODO:
 * 1. Get LLM API key from Slack/team
 * 2. Implement prompt engineering for Norwegian content
 * 3. Add content safety filtering (Itera values compliance)
 * 4. Integrate with Giphy API for relevant GIFs
 * 5. Add caching to reduce API calls
 * 
 * The LLM should generate:
 * - A motivating or funny quote related to the task
 * - An interesting (or irrelevant) fact
 * - A tip (serious or silly based on personality)
 * - An appropriate emoji
 */

const placeholderResponses: Record<string, MotivationResponse> = {
  silly: {
    quote: "Hvorfor gjøre i dag det du kan utsette til i morgen? ...Bare tuller, kom igjen! 💪",
    fact: "Visste du at en gjennomsnittlig person bruker 6 måneder av livet sitt på å vente på rødt lys?",
    tip: "Prøv å gjøre oppgaven mens du står på ett ben. Det er ineffektivt, men morsomt!",
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

export async function getMotivation(request: MotivationRequest): Promise<MotivationResponse> {
  const personality = request.personality || 'silly';
  
  // TODO: Replace with actual LLM API call
  // For now, return placeholder data based on personality
  const response = placeholderResponses[personality] || placeholderResponses.silly;
  
  // Simulate async API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    ...response,
    // In real implementation, the quote/fact/tip would be contextual to request.task
  };
}
