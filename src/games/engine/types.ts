export type Suit = 'oros' | 'copas' | 'espadas' | 'bastos';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12;

export interface Card {
    suit: Suit;
    rank: Rank;
}

export interface PlayedCard {
    player: number;
    card: Card;
}

export interface TrickRecord {
    plays: PlayedCard[];
    winner: number;
    points: number;
}

export type GamePhase = 'playing' | 'finished';

export interface GameState {
    id: string;
    playerCount: number;
    hands: Card[][];
    trumpCard: Card;
    trumpSuit: Suit;
    drawQueue: Card[];
    currentTrick: PlayedCard[];
    leader: number;
    scores: number[];
    history: TrickRecord[];
    phase: GamePhase;
    winner: number | null;
}