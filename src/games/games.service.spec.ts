import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { Card } from 'brisca-engine';

describe('GamesService', () => {
  let service: GamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamesService],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDeck', () => {
    it('returns 40 unique cards', () => {
      const deck = service.getDeck();
      expect(deck).toHaveLength(40);

      const unique = new Set(deck.map((c) => `${c.suit}-${c.rank}`));
      expect(unique.size).toBe(40);
    });
  });

  describe('getCardPoints', () => {
    it('gives the Ace 11 points', () => {
      expect(service.getCardPoints({ suit: 'oros', rank: 1 })).toBe(11);
    });

    it('gives the Three 10 points', () => {
      expect(service.getCardPoints({ suit: 'copas', rank: 3 })).toBe(10);
    });

    it('gives number cards with no face value 0 points', () => {
      expect(service.getCardPoints({ suit: 'bastos', rank: 4 })).toBe(0);
      expect(service.getCardPoints({ suit: 'bastos', rank: 7 })).toBe(0);
    });
  });

  describe('getTrickWinner', () => {
    it('trump beats non-trump regardless of rank', () => {
      const cards: Card[] = [
        { suit: 'oros', rank: 1 }, // strongest non-trump card
        { suit: 'copas', rank: 2 }, // weakest trump card
      ];
      const winner = service.getTrickWinner(cards, 'copas');
      expect(winner).toEqual({ suit: 'copas', rank: 2 });
    });

    it('highest lead-suit card wins when no trumps are played', () => {
      const cards: Card[] = [
        { suit: 'oros', rank: 7 },
        { suit: 'oros', rank: 1 }, // Ace is strongest
        { suit: 'oros', rank: 3 },
      ];
      const winner = service.getTrickWinner(cards, 'bastos');
      expect(winner).toEqual({ suit: 'oros', rank: 1 });
    });

    it('a card outside the lead suit and not trump cannot win', () => {
      const cards: Card[] = [
        { suit: 'oros', rank: 2 }, // lead suit, weak
        { suit: 'copas', rank: 1 }, // off-suit Ace, cannot win
      ];
      const winner = service.getTrickWinner(cards, 'bastos');
      expect(winner).toEqual({ suit: 'oros', rank: 2 });
    });

    it('among two trumps, higher strength wins (3 beats King)', () => {
      const cards: Card[] = [
        { suit: 'espadas', rank: 12 }, // King
        { suit: 'espadas', rank: 3 }, // Three outranks King
      ];
      const winner = service.getTrickWinner(cards, 'espadas');
      expect(winner).toEqual({ suit: 'espadas', rank: 3 });
    });
  });

  describe('dealHand', () => {
    it('deals 3 cards to each player and reveals a trump card', () => {
      const { hands, trumpCard, remainingDeck } = service.dealHand(4);

      expect(hands).toHaveLength(4);
      for (const hand of hands) {
        expect(hand).toHaveLength(3);
      }
      expect(trumpCard).toBeDefined();
      // 40 - (4*3 dealt) - 1 trump = 27 remaining
      expect(remainingDeck).toHaveLength(27);
    });

    it('throws for an invalid player count', () => {
      expect(() => service.dealHand(1)).toThrow();
      expect(() => service.dealHand(5)).toThrow();
    });
  });

  describe('simulateGame', () => {
    it('plays out a full game and produces scores summing to 120 points', () => {
      const result = service.simulateGame(2);
      const total = result.scores.reduce((sum, s) => sum + s, 0);
      expect(total).toBe(120);
    });

    it('declares a valid winner index', () => {
      const result = service.simulateGame(3);
      expect(result.winner).toBeGreaterThanOrEqual(0);
      expect(result.winner).toBeLessThan(3);
    });
  });
});