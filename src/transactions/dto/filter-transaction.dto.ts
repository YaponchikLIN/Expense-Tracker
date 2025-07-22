import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransactionType } from '../transaction.entity';

export class FilterTransactionDto {
  @ApiPropertyOptional({
    description: 'Тип транзакции',
    enum: TransactionType,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    description: 'ID категории',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Дата начала периода',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Дата окончания периода',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Поиск по описанию',
    example: 'продукты',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Поле для сортировки',
    example: 'date',
    default: 'date',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'date';

  @ApiPropertyOptional({
    description: 'Направление сортировки',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}