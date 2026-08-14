import { IsIn, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { Rank, Suit } from 'brisca-engine';


const VALID_SUITS: Suit[] = ['oros', 'copas', 'espadas', 'bastos'];
const VALID_RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

export class CardPointsQueryDto {
    @IsIn(VALID_SUITS)
    suit: Suit;

    @Type(() => Number)
    @IsInt()
    @IsIn(VALID_RANKS)
    rank: Rank;
}