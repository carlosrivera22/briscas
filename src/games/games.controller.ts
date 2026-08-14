import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { Card, Suit } from './engine/types';
import { CardPointsQueryDto } from './dto/card-points-query.dto';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) { }

    @Get('deck')
    getDeck() {
        return this.gamesService.getDeck();
    }

    @Get('card-points')
    getCardPoints(@Query() query: CardPointsQueryDto) {
        const card: Card = { suit: query.suit, rank: query.rank };
        return { card, points: this.gamesService.getCardPoints(card) };
    }

    @Post('trick-winner')
    getTrickWinner(@Body() body: { cards: Card[]; trumpSuit: Suit }) {
        const winner = this.gamesService.getTrickWinner(body.cards, body.trumpSuit);
        return { winner };
    }

    @Get('deal')
    dealHand(@Query('players') players: string) {
        const playerCount = players ? Number(players) : 2;
        return this.gamesService.dealHand(playerCount);
    }

    @Get('simulate')
    simulateGame(@Query('players') players: string) {
        const playerCount = players ? Number(players) : 2;
        return this.gamesService.simulateGame(playerCount);
    }
}