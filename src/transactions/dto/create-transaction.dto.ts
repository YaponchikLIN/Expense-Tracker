import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TransactionType } from '../transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Сумма транзакции',
    example: 1500.50,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Сумма должна быть числом' })
  @Min(0.01, { message: 'Сумма должна быть больше 0' })
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiProperty({
    description: 'Описание транзакции',
    example: 'Покупка продуктов',
  })
  @IsString({ message: 'Описание должно быть строкой' })
  @IsNotEmpty({ message: 'Описание обязательно' })
  description: string;

  @ApiProperty({
    description: 'Дата транзакции',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
  })
  @IsDateString({}, { message: 'Некорректная дата' })
  @IsNotEmpty({ message: 'Дата обязательна' })
  date: string;

  @ApiProperty({
    description: 'Тип транзакции',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @IsEnum(TransactionType, { message: 'Некорректный тип транзакции' })
  @IsNotEmpty({ message: 'Тип транзакции обязателен' })
  type: TransactionType;

  @ApiProperty({
    description: 'ID категории',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Некорректный ID категории' })
  categoryId?: string;

  @ApiProperty({
    description: 'Теги транзакции (через запятую)',
    example: 'еда, продукты, супермаркет',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Теги должны быть строкой' })
  tags?: string;

  @ApiProperty({
    description: 'Дополнительные заметки',
    example: 'Покупка на неделю',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Заметки должны быть строкой' })
  notes?: string;
}