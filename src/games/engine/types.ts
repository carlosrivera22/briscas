export type Suit = 'oros' | 'copas' | 'espadas' | 'bastos';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12;

export interface Card {
    suit: Suit;
    rank: Rank;
}