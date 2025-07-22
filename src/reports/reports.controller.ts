import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Отчеты')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  @ApiOperation({ summary: 'Получение месячного отчета' })
  @ApiQuery({
    name: 'month',
    required: true,
    description: 'Месяц (1-12)',
    type: Number,
  })
  @ApiQuery({
    name: 'year',
    required: true,
    description: 'Год',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Месячный отчет',
  })
  getMonthlyReport(
    @Query('month') month: number,
    @Query('year') year: number,
    @GetUser() user: User,
  ) {
    return this.reportsService.getMonthlyReport(user.id, month, year);
  }

  @Get('yearly')
  @ApiOperation({ summary: 'Получение годового отчета' })
  @ApiQuery({
    name: 'year',
    required: true,
    description: 'Год',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Годовой отчет',
  })
  getYearlyReport(@Query('year') year: number, @GetUser() user: User) {
    return this.reportsService.getYearlyReport(user.id, year);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Получение отчета за период' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Начальная дата (YYYY-MM-DD)',
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'Конечная дата (YYYY-MM-DD)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Отчет за период',
  })
  getDateRangeReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetUser() user: User,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.reportsService.getDateRangeReport(user.id, start, end);
  }

  @Get('top-categories')
  @ApiOperation({ summary: 'Получение топ категорий по расходам' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество категорий (по умолчанию 5)',
    type: Number,
  })
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
    description: 'Топ категории по расходам',
  })
  getTopCategories(
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @GetUser() user?: User,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportsService.getTopCategories(user!.id, limit, start, end);
  }
}