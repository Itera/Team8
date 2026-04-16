import { Router } from 'express';
import cowsay from 'cowsay';

export const cowsayRouter = Router();

const COWSAY_COMMENTS = [
  (input: string) => `Så du vil jobbe med "${input}"? MOO godt valg!`,
  (input: string) => `"${input}" – det høres ut som en kjempestor plan, MOO!`,
  (input: string) => `Jeg, kua, tror fullt og helt på at "${input}" vil gå bra!`,
  (input: string) => `MOO! "${input}" er akkurat det verden trenger nå!`,
  (input: string) => `Etter 42 år som ku har jeg aldri hørt noe bedre enn "${input}"!`,
  (input: string) => `"${input}"?! Fantastisk! Jeg skal fortelle det til resten av fjøset!`,
  (input: string) => `Mens jeg beiter tenker jeg på "${input}" – og det gjør meg glad!`,
  (input: string) => `MOO! "${input}" er klart bedre enn å tygge gress!`,
];

cowsayRouter.post('/', (req, res) => {
  const { text } = req.body as { text?: string };

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({ error: 'Mangler tekst til kua!' });
    return;
  }

  const comment = COWSAY_COMMENTS[Math.floor(Math.random() * COWSAY_COMMENTS.length)](text.trim());

  const art = cowsay.say({
    text: comment,
    e: 'oO',
    T: 'U ',
  });

  res.json({ art });
});
