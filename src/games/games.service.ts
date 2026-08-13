import { Injectable } from '@nestjs/common';
import { buildDeck, cardPoints, rankStrength } from './engine/deck';
import { Card, Suit } from './engine/types';

@Injectable()
export class GamesService {
    getDeck(): Card[] {
        return buildDeck();
    }

    getCardPoints(card: Card): number {
        return cardPoints(card);
    }

    getTrickWinner(cards: Card[], trumpSuit: Suit): Card {
        const leadSuit = cards[0].suit;

        return cards.reduce((winner, challenger) => {
            const winnerIsTrump = winner.suit === trumpSuit;
            const challengerIsTrump = challenger.suit === trumpSuit;

            if (challengerIsTrump && !winnerIsTrump) return challenger;
            if (winnerIsTrump && !challengerIsTrump) return winner;

            if (challengerIsTrump && winnerIsTrump) {
                return rankStrength(challenger.rank) > rankStrength(winner.rank) ? challenger : winner;
            }

            // neither is trump: only lead-suit cards can win
            const winnerFollowsLead = winner.suit === leadSuit;
            const challengerFollowsLead = challenger.suit === leadSuit;

            if (challengerFollowsLead && !winnerFollowsLead) return challenger;
            if (winnerFollowsLead && !challengerFollowsLead) return winner;
            if (!winnerFollowsLead && !challengerFollowsLead) return winner;

            return rankStrength(challenger.rank) > rankStrength(winner.rank) ? challenger : winner;
        });
    }
}