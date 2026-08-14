import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { buildDeck, cardPoints, rankStrength, shuffle } from './engine/deck';
import { Card, GameState, Suit } from './engine/types';

const HAND_SIZE = 3;

@Injectable()
export class GamesService {
    private games = new Map<string, GameState>();

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
            throw new BadRequestException('Brisca supports 2 to 4 players.');
        }

        const deck = shuffle(this.getDeck());
        const hands: Card[][] = Array.from({ length: playerCount }, () => []);

        for (let round = 0; round < HAND_SIZE; round++) {
            for (let p = 0; p < playerCount; p++) {
                hands[p].push(deck.pop() as Card);
            }
        }

        const trumpCard = deck.pop() as Card;

        return { hands, trumpCard, remainingDeck: deck };
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

            const winningCard = this.getTrickWinner(plays.map((p) => p.card), trumpSuit);
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

        return { trumpCard, history, scores, winner: scores.indexOf(Math.max(...scores)) };
    }

    // ---------- Stateful game management ----------

    createGame(playerCount: number): GameState {
        if (this.games.size > 0) {
            throw new ConflictException('A game is already in progress. Delete it before starting a new one.');
        }

        const { hands, trumpCard, remainingDeck } = this.dealHand(playerCount);

        const game: GameState = {
            id: randomUUID(),
            playerCount,
            hands,
            trumpCard,
            trumpSuit: trumpCard.suit,
            drawQueue: remainingDeck,
            currentTrick: [],
            leader: 0,
            scores: Array.from({ length: playerCount }, () => 0),
            history: [],
            phase: 'playing',
            winner: null,
        };

        this.games.set(game.id, game);
        return game;
    }

    deleteGame(id: string): void {
        const existed = this.games.delete(id);
        if (!existed) {
            throw new NotFoundException(`No game with id ${id}.`);
        }
    }

    getGame(id: string): GameState {
        const game = this.games.get(id);
        if (!game) {
            throw new NotFoundException(`No game with id ${id}.`);
        }
        return game;
    }

    playCard(id: string, player: number, card: Card): GameState {
        const game = this.getGame(id);

        if (game.phase === 'finished') {
            throw new BadRequestException('This game has already finished.');
        }

        const expectedPlayer = (game.leader + game.currentTrick.length) % game.playerCount;
        if (player !== expectedPlayer) {
            throw new BadRequestException(`It is player ${expectedPlayer}'s turn, not player ${player}'s.`);
        }

        const hand = game.hands[player];
        const cardIndex = hand.findIndex((c) => c.suit === card.suit && c.rank === card.rank);
        if (cardIndex === -1) {
            throw new BadRequestException(`Player ${player} does not hold that card.`);
        }

        const [playedCard] = hand.splice(cardIndex, 1);
        game.currentTrick.push({ player, card: playedCard });

        if (game.currentTrick.length < game.playerCount) {
            return game;
        }

        // Trick is complete: resolve it.
        const winningCard = this.getTrickWinner(
            game.currentTrick.map((p) => p.card),
            game.trumpSuit,
        );
        const winningPlay = game.currentTrick.find(
            (p) => p.card.suit === winningCard.suit && p.card.rank === winningCard.rank,
        )!;
        const points = game.currentTrick.reduce((sum, p) => sum + cardPoints(p.card), 0);

        game.scores[winningPlay.player] += points;
        game.history.push({ plays: game.currentTrick, winner: winningPlay.player, points });

        const drawOrder = Array.from(
            { length: game.playerCount },
            (_, i) => (winningPlay.player + i) % game.playerCount,
        );
        for (const p of drawOrder) {
            const drawn = game.drawQueue.shift();
            if (!drawn) break;
            game.hands[p].push(drawn);
        }

        game.leader = winningPlay.player;
        game.currentTrick = [];

        const isOver = game.hands.every((h) => h.length === 0);
        if (isOver) {
            game.phase = 'finished';
            game.winner = game.scores.indexOf(Math.max(...game.scores));
            this.games.delete(game.id);
        }

        return game;
    }
}