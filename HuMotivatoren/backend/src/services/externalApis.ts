/**
 * External API integrations (GIFs, news, fun facts, trivia).
 * TODO: Implement actual API calls (Rosa)
 */

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function fetchGif(query: string): Promise<string | undefined> {
  if (!GIPHY_API_KEY) {
    console.warn('⚠️ GIPHY_API_KEY not set — skipping GIF fetch');
    return undefined;
  }

  // TODO: Call Giphy API
  console.log(`TODO: Fetch GIF for query: ${query}`);
  return undefined;
}

export async function fetchFunFact(): Promise<string | undefined> {
  // TODO: Call a fun facts API (e.g., uselessfacts.jsph.pl)
  console.log('TODO: Fetch random fun fact');
  return 'En blekksprut har tre hjerter.';
}

export async function fetchNews(topic: string): Promise<string | undefined> {
  if (!NEWS_API_KEY) {
    console.warn('⚠️ NEWS_API_KEY not set — skipping news fetch');
    return undefined;
  }

  // TODO: Call NewsAPI
  console.log(`TODO: Fetch news for topic: ${topic}`);
  return undefined;
}
