import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class CreateGameDto {
    @Type(() => Number)
    @IsInt()
    @Min(2)
    @Max(4)
    playerCount: number;
}