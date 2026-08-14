import { Rank, Suit } from 'brisca-engine';
import { Type } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';

const VALID_SUITS: Suit[] = ['oros', 'copas', 'espadas', 'bastos'];
const VALID_RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

export class PlayCardDto {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    player: number;

    @IsIn(VALID_SUITS)
    suit: Suit;

    @Type(() => Number)
    @IsInt()
    @IsIn(VALID_RANKS)
    rank: Rank;
}