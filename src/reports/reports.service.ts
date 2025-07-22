import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../transactions/transaction.entity';

export interface MonthlyReport {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
  transactionCount: number;
}

export interface CategoryReport {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  income: number;
  expense: number;
  transactionCount: number;
  percentage: number;
}

export interface YearlyReport {
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyData: MonthlyReport[];
  topCategories: CategoryReport[];
}

export interface DateRangeReport {
  startDate: Date;
  endDate: Date;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  };
  categoryBreakdown: CategoryReport[];
  dailyTrends: Array<{
    date: string;
    income: number;
    expense: number;
    balance: number;
  }>;
}

@Injectable()
export class ReportsService {
  constructor(private transactionsService: TransactionsService) {}

  async getMonthlyReport(
    userId: string,
    month: number,
    year: number,
  ): Promise<MonthlyReport> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const summary = await this.transactionsService.getSummary(
      userId,
      startDate,
      endDate,
    );

    return {
      month,
      year,
      income: summary.totalIncome,
      expense: summary.totalExpense,
      balance: summary.balance,
      transactionCount: summary.transactionCount,
    };
  }

  async getYearlyReport(userId: string, year: number): Promise<YearlyReport> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Получаем общую сводку за год
    const yearSummary = await this.transactionsService.getSummary(
      userId,
      startDate,
      endDate,
    );

    // Получаем месячную статистику
    const monthlyStats = await this.transactionsService.getMonthlyStats(
      userId,
      year,
    );

    // Преобразуем месячную статистику в удобный формат
    const monthlyData: MonthlyReport[] = [];
    for (let month = 1; month <= 12; month++) {
      const monthIncome =
        monthlyStats.find(
          (stat) => stat.month === month && stat.type === TransactionType.INCOME,
        )?.total || 0;
      const monthExpense =
        monthlyStats.find(
          (stat) => stat.month === month && stat.type === TransactionType.EXPENSE,
        )?.total || 0;

      monthlyData.push({
        month,
        year,
        income: parseFloat(monthIncome),
        expense: parseFloat(monthExpense),
        balance: parseFloat(monthIncome) - parseFloat(monthExpense),
        transactionCount: 0, // Можно добавить подсчет если нужно
      });
    }

    // Получаем статистику по категориям
    const categoryStats = await this.transactionsService.getCategoryStats(
      userId,
      startDate,
      endDate,
    );

    const topCategories = this.processCategoryStats(
      categoryStats,
      yearSummary.totalExpense,
    );

    return {
      year,
      totalIncome: yearSummary.totalIncome,
      totalExpense: yearSummary.totalExpense,
      balance: yearSummary.balance,
      monthlyData,
      topCategories: topCategories.slice(0, 10), // Топ 10 категорий
    };
  }

  async getDateRangeReport(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DateRangeReport> {
    // Получаем общую сводку
    const summary = await this.transactionsService.getSummary(
      userId,
      startDate,
      endDate,
    );

    // Получаем статистику по категориям
    const categoryStats = await this.transactionsService.getCategoryStats(
      userId,
      startDate,
      endDate,
    );

    const categoryBreakdown = this.processCategoryStats(
      categoryStats,
      summary.totalExpense,
    );

    // Генерируем дневные тренды (упрощенная версия)
    const dailyTrends = await this.generateDailyTrends(
      userId,
      startDate,
      endDate,
    );

    return {
      startDate,
      endDate,
      summary: {
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        balance: summary.balance,
        transactionCount: summary.transactionCount,
      },
      categoryBreakdown,
      dailyTrends,
    };
  }

  async getTopCategories(
    userId: string,
    limit: number = 5,
    startDate?: Date,
    endDate?: Date,
  ): Promise<CategoryReport[]> {
    const categoryStats = await this.transactionsService.getCategoryStats(
      userId,
      startDate,
      endDate,
    );

    const summary = await this.transactionsService.getSummary(
      userId,
      startDate,
      endDate,
    );

    const processedCategories = this.processCategoryStats(
      categoryStats,
      summary.totalExpense,
    );

    return processedCategories
      .sort((a, b) => b.expense - a.expense)
      .slice(0, limit);
  }

  private processCategoryStats(
    categoryStats: any[],
    totalExpense: number,
  ): CategoryReport[] {
    const categoryMap = new Map<string, CategoryReport>();

    categoryStats.forEach((stat) => {
      const categoryId = stat.categoryid;
      const categoryName = stat.categoryname;
      const categoryColor = stat.categorycolor;
      const type = stat.type;
      const total = parseFloat(stat.total);

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName,
          categoryColor,
          income: 0,
          expense: 0,
          transactionCount: 0,
          percentage: 0,
        });
      }

      const category = categoryMap.get(categoryId)!;
      if (type === TransactionType.INCOME) {
        category.income += total;
      } else {
        category.expense += total;
      }
      category.transactionCount += parseInt(stat.count);
    });

    // Вычисляем проценты для расходов
    const categories = Array.from(categoryMap.values());
    categories.forEach((category) => {
      if (totalExpense > 0) {
        category.percentage = (category.expense / totalExpense) * 100;
      }
    });

    return categories;
  }

  private async generateDailyTrends(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{
    date: string;
    income: number;
    expense: number;
    balance: number;
  }>> {
    const trends: Array<{
      date: string;
      income: number;
      expense: number;
      balance: number;
    }> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const transactions = await this.transactionsService.findAll(
         userId,
         { 
           startDate: dayStart.toISOString().split('T')[0], 
           endDate: dayEnd.toISOString().split('T')[0] 
         },
       );

    const daySummary = await this.transactionsService.getSummary(
      userId,
      dayStart,
      dayEnd,
    );

      trends.push({
        date: currentDate.toISOString().split('T')[0],
        income: daySummary.totalIncome,
        expense: daySummary.totalExpense,
        balance: daySummary.balance,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trends;
  }
}