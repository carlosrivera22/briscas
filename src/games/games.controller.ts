import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { Card, Rank, Suit } from './engine/types';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) { }

    @Get('deck')
    getDeck() {
        return this.gamesService.getDeck();
    }

    @Get('card-points')
    getCardPoints(@Query('suit') suit: Suit, @Query('rank') rank: string) {
        const card: Card = { suit, rank: Number(rank) as Rank };
        return { card, points: this.gamesService.getCardPoints(card) };
    }

    @Post('trick-winner')
    getTrickWinner(@Body() body: { cards: Card[]; trumpSuit: Suit }) {
        const winner = this.gamesService.getTrickWinner(body.cards, body.trumpSuit);
        return { winner };
    }
}