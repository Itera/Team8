import { Router } from 'express';
import type { AskRequest, AskResponse } from '../types/index.js';

export const askRouter = Router();

const MOTIVATIONAL_RESPONSES: Array<{
  answer: (q: string) => string;
  encouragement: string;
  emoji: string;
  irrelevantFact: string;
}> = [
  {
    answer: (q) => `Svaret på "${q}" er enklere enn du tror — du har allerede alt du trenger!`,
    encouragement: 'Det at du spør viser at du allerede er halvveis der!',
    emoji: '🚀',
    irrelevantFact: 'En gjennomsnittlig sky veier over 500 000 kilo, men faller ikke ned. Du kan også klare dette.',
  },
  {
    answer: (q) => `"${q}"? Fantastisk spørsmål! Universets svar er: JA, du klarer det!`,
    encouragement: 'Hvert steg fremover teller, uansett størrelse.',
    emoji: '🌟',
    irrelevantFact: 'Honningbier flyr med ca. 25 km/t og besøker 2 millioner blomster for å lage 500g honning. Du er minst like hardt arbeidende.',
  },
  {
    answer: (q) => `Forskning* viser at alle som spør om "${q}" oppnår suksess innen rimelig tid. (*Kilde: kua vår)`,
    encouragement: 'Ikke tenk på sluttmålet — tenk bare på neste lille steg.',
    emoji: '💪',
    irrelevantFact: 'Blekkspruter har tre hjerter. Du trenger bare ett for å lykkes.',
  },
  {
    answer: (q) => `Svaret på "${q}" er 42 — men vi tror du var ute etter noe mer praktisk, og det er: bare gjør det!`,
    encouragement: 'Perfeksjon er fienden til fremdrift. Bra nok i dag er bedre enn perfekt aldri.',
    emoji: '🎯',
    irrelevantFact: 'En snegl kan sove i opptil 3 år. Du har absolutt tid til å fullføre dette.',
  },
  {
    answer: (q) => `"${q}" — vi spurte en botaniker, en rørlegger og en pensjonert astronaut. Alle tre sa: du greier det!`,
    encouragement: 'Ta en dyp pust. Du vet mer enn du tror.',
    emoji: '🌈',
    irrelevantFact: 'Kleopatra levde nærmere i tid til iPhone enn til pyramidene. Historisk perspektiv: du har god tid.',
  },
];

askRouter.post('/', (req, res) => {
  const { question } = req.body as AskRequest;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    res.status(400).json({
      error: 'Mangler spørsmål! Hva lurer du på? 🤔',
      code: 'MISSING_QUESTION',
    });
    return;
  }

  if (question.trim().length > 280) {
    res.status(400).json({
      error: 'Spørsmålet er for langt! Maks 280 tegn.',
      code: 'INPUT_TOO_LONG',
    });
    return;
  }

  try {
    const pick = MOTIVATIONAL_RESPONSES[
      Math.floor(Math.random() * MOTIVATIONAL_RESPONSES.length)
    ];

    const response: AskResponse = {
      answer: pick.answer(question.trim()),
      encouragement: pick.encouragement,
      irrelevantFact: pick.irrelevantFact,
      emoji: pick.emoji,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in /api/ask:', error);
    res.status(500).json({
      error: 'Noe gikk galt på serveren 😅',
      code: 'INTERNAL_ERROR',
    });
  }
});
