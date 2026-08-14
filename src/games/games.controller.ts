import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { CardPointsQueryDto } from './dto/card-points-query.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { PlayCardDto } from './dto/play-card.dto';
import { Card, Suit } from 'brisca-engine';

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

    // ---------- Stateful game endpoints ----------

    @Post()
    createGame(@Body() body: CreateGameDto) {
        return this.gamesService.createGame(body.playerCount);
    }

    @Get(':id')
    getGame(@Param('id') id: string) {
        return this.gamesService.getGame(id);
    }

    @Post(':id/play')
    playCard(@Param('id') id: string, @Body() body: PlayCardDto) {
        const card: Card = { suit: body.suit, rank: body.rank };
        return this.gamesService.playCard(id, body.player, card);
    }

    @Delete(':id')
    deleteGame(@Param('id') id: string) {
        this.gamesService.deleteGame(id);
        return { deleted: true };
    }
}