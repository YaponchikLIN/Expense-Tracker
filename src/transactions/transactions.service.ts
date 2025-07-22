import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindManyOptions } from 'typeorm';
import { Transaction, TransactionType } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { CategoriesService } from '../categories/categories.service';

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private categoriesService: CategoriesService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    const { categoryId, ...transactionData } = createTransactionDto;

    // Проверяем, что категория существует и принадлежит пользователю
    await this.categoriesService.findOne(categoryId!, userId);

    const transaction = this.transactionsRepository.create({
      ...transactionData,
      categoryId,
      userId,
    });

    return this.transactionsRepository.save(transaction);
  }

  async findAll(
    userId: string,
    filterDto: FilterTransactionDto,
  ): Promise<PaginatedTransactions> {
    const {
      type,
      categoryId,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'DESC',
    } = filterDto;

    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId });

    // Фильтр по типу транзакции
    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    // Фильтр по категории
    if (categoryId) {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', {
        categoryId,
      });
    }

    // Фильтр по диапазону дат
    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate });
    }

    // Поиск по описанию
    if (search) {
      queryBuilder.andWhere(
        '(transaction.description ILIKE :search OR transaction.notes ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Сортировка
    const validSortFields = ['date', 'amount', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
    queryBuilder.orderBy(`transaction.${sortField}`, sortOrder);

    // Пагинация
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
      relations: ['category'],
    });

    if (!transaction) {
      throw new NotFoundException('Транзакция не найдена');
    }

    return transaction;
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);
    const { categoryId, ...updateData } = updateTransactionDto;

    // Если изменяется категория, проверяем её принадлежность пользователю
    if (categoryId && categoryId !== transaction.categoryId) {
      await this.categoriesService.findOne(categoryId, userId);
      transaction.categoryId = categoryId;
    }

    Object.assign(transaction, updateData);
    return this.transactionsRepository.save(transaction);
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findOne(id, userId);
    await this.transactionsRepository.remove(transaction);
  }

  async getSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TransactionSummary> {
    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });

    // Фильтр по диапазону дат
    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const transactions = await queryBuilder.getMany();

    const summary = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === TransactionType.INCOME) {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpense += transaction.amount;
        }
        acc.transactionCount++;
        return acc;
      },
      {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
      },
    );

    summary.balance = summary.totalIncome - summary.totalExpense;

    return summary;
  }

  async getMonthlyStats(userId: string, year: number) {
    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .select([
        'EXTRACT(MONTH FROM transaction.date) as month',
        'transaction.type as type',
        'SUM(transaction.amount) as total',
      ])
      .where('transaction.userId = :userId', { userId })
      .andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year })
      .groupBy('EXTRACT(MONTH FROM transaction.date), transaction.type')
      .orderBy('month');

    return queryBuilder.getRawMany();
  }

  async getCategoryStats(userId: string, startDate?: Date, endDate?: Date) {
    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.category', 'category')
      .select([
        'category.id as categoryId',
        'category.name as categoryName',
        'category.color as categoryColor',
        'transaction.type as type',
        'SUM(transaction.amount) as total',
        'COUNT(transaction.id) as count',
      ])
      .where('transaction.userId = :userId', { userId })
      .groupBy('category.id, category.name, category.color, transaction.type');

    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return queryBuilder.getRawMany();
  }
}