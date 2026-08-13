import { Card, Rank, Suit } from './types';

export const SUITS: Suit[] = ['oros', 'copas', 'espadas', 'bastos'];
export const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

export const CARD_POINTS: Record<Rank, number> = {
    1: 11,
    3: 10,
    12: 4,
    11: 3,
    10: 2,
    7: 0,
    6: 0,
    5: 0,
    4: 0,
    2: 0,
};

export function cardPoints(card: Card): number {
    return CARD_POINTS[card.rank];
}

export function buildDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ suit, rank });
        }
    }
    return deck;
}

const RANK_STRENGTH_ORDER: Rank[] = [1, 3, 12, 11, 10, 7, 6, 5, 4, 2];

export function rankStrength(rank: Rank): number {
    // Higher number = stronger card
    return RANK_STRENGTH_ORDER.length - RANK_STRENGTH_ORDER.indexOf(rank);
}

export function shuffle<T>(items: T[]): T[] {
    const arr = items.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}