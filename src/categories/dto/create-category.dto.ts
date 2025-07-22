import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsHexColor,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Название категории',
    example: 'Продукты питания',
  })
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  name: string;

  @ApiProperty({
    description: 'Описание категории',
    example: 'Расходы на еду и напитки',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiProperty({
    description: 'Цвет категории в HEX формате',
    example: '#ff6b6b',
    default: '#6366f1',
  })
  @IsOptional()
  @IsHexColor({ message: 'Некорректный HEX цвет' })
  color?: string = '#6366f1';

  @ApiProperty({
    description: 'Иконка категории',
    example: '🍕',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Иконка должна быть строкой' })
  icon?: string;

  @ApiProperty({
    description: 'Активна ли категория',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive должно быть булевым значением' })
  isActive?: boolean = true;
}