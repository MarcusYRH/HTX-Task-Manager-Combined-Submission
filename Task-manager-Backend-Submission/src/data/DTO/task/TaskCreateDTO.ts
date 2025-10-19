import { IsString, IsNotEmpty, IsArray, IsNumber, IsOptional } from 'class-validator';

export class TaskCreateDTO {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    skillIds?: number[];

    @IsOptional()
    @IsNumber()
    developerId?: number | null;

    @IsOptional()
    @IsNumber()
    parentTaskId?: number;
}
