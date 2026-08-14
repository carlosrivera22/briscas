import { Injectable } from '@nestjs/common';
import { buildDeck, cardPoints, rankStrength, shuffle } from './engine/deck';
import { Card, Suit } from './engine/types';

const HAND_SIZE = 3;

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

    dealHand(playerCount: number) {
        if (playerCount < 2 || playerCount > 4) {
            throw new Error('Brisca supports 2 to 4 players.');
        }

        const deck = shuffle(this.getDeck());
        const hands: Card[][] = Array.from({ length: playerCount }, () => []);

        for (let round = 0; round < HAND_SIZE; round++) {
            for (let p = 0; p < playerCount; p++) {
                hands[p].push(deck.pop() as Card);
            }
        }

        const trumpCard = deck.pop() as Card;

        return {
            hands,
            trumpCard,
            remainingDeck: deck,
        };
    }

    simulateGame(playerCount: number) {
        const { hands, trumpCard, remainingDeck } = this.dealHand(playerCount);
        const trumpSuit = trumpCard.suit;
        const drawQueue = [...remainingDeck, trumpCard];

        const scores = Array.from({ length: playerCount }, () => 0);
        const history: { plays: { player: number; card: Card }[]; winner: number; points: number }[] = [];

        let leader = 0;

        while (hands.some((hand) => hand.length > 0)) {
            const plays: { player: number; card: Card }[] = [];

            for (let i = 0; i < playerCount; i++) {
                const player = (leader + i) % playerCount;
                const hand = hands[player];
                if (hand.length === 0) continue;
                const card = hand.shift() as Card;
                plays.push({ player, card });
            }

            const winningCard = this.getTrickWinner(
                plays.map((p) => p.card),
                trumpSuit,
            );
            const winningPlay = plays.find((p) => p.card === winningCard) as { player: number; card: Card };
            const points = plays.reduce((sum, p) => sum + cardPoints(p.card), 0);

            scores[winningPlay.player] += points;
            history.push({ plays, winner: winningPlay.player, points });

            const drawOrder = Array.from({ length: playerCount }, (_, i) => (winningPlay.player + i) % playerCount);
            for (const player of drawOrder) {
                const drawn = drawQueue.shift();
                if (!drawn) break;
                hands[player].push(drawn);
            }

            leader = winningPlay.player;
        }

        return {
            trumpCard,
            history,
            scores,
            winner: scores.indexOf(Math.max(...scores)),
        };
    }
}