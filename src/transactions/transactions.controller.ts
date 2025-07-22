import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Транзакции')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Создание новой транзакции' })
  @ApiResponse({
    status: 201,
    description: 'Транзакция успешно создана',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
  })
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @GetUser() user: User,
  ) {
    return this.transactionsService.create(createTransactionDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка транзакций с фильтрацией' })
  @ApiResponse({
    status: 200,
    description: 'Список транзакций',
  })
  findAll(@Query() filterDto: FilterTransactionDto, @GetUser() user: User) {
    return this.transactionsService.findAll(user.id, filterDto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Получение сводки по транзакциям' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Начальная дата (YYYY-MM-DD)',
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Конечная дата (YYYY-MM-DD)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Сводка по транзакциям',
  })
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @GetUser() user?: User,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.transactionsService.getSummary(user!.id, start, end);
  }

  @Get('stats/monthly')
  @ApiOperation({ summary: 'Получение месячной статистики' })
  @ApiQuery({
    name: 'year',
    required: true,
    description: 'Год для статистики',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Месячная статистика',
  })
  getMonthlyStats(@Query('year') year: number, @GetUser() user: User) {
    return this.transactionsService.getMonthlyStats(user.id, year);
  }

  @Get('stats/categories')
  @ApiOperation({ summary: 'Получение статистики по категориям' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Начальная дата (YYYY-MM-DD)',
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Конечная дата (YYYY-MM-DD)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Статистика по категориям',
  })
  getCategoryStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @GetUser() user?: User,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.transactionsService.getCategoryStats(user!.id, start, end);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение транзакции по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID транзакции',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Данные транзакции',
  })
  @ApiResponse({
    status: 404,
    description: 'Транзакция не найдена',
  })
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.transactionsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление транзакции' })
  @ApiParam({
    name: 'id',
    description: 'ID транзакции',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Транзакция успешно обновлена',
  })
  @ApiResponse({
    status: 404,
    description: 'Транзакция не найдена',
  })
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @GetUser() user: User,
  ) {
    return this.transactionsService.update(id, user.id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление транзакции' })
  @ApiParam({
    name: 'id',
    description: 'ID транзакции',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Транзакция успешно удалена',
  })
  @ApiResponse({
    status: 404,
    description: 'Транзакция не найдена',
  })
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.transactionsService.remove(id, user.id);
    return { message: 'Транзакция успешно удалена' };
  }
}