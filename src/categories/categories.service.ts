import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      userId,
    });

    return this.categoriesRepository.save(category);
  }

  async findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findActive(userId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { userId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return category;
  }

  async update(
    id: string,
    userId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id, userId);

    // Проверяем, что пользователь не пытается изменить системную категорию
    if (category.isDefault) {
      throw new ForbiddenException('Нельзя изменять системную категорию');
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId);

    // Проверяем, что пользователь не пытается удалить системную категорию
    if (category.isDefault) {
      throw new ForbiddenException('Нельзя удалять системную категорию');
    }

    // Проверяем, есть ли транзакции с этой категорией
    const transactionCount = await this.categoriesRepository
      .createQueryBuilder('category')
      .leftJoin('category.transactions', 'transaction')
      .where('category.id = :id', { id })
      .getCount();

    if (transactionCount > 0) {
      // Вместо удаления деактивируем категорию
      category.isActive = false;
      await this.categoriesRepository.save(category);
    } else {
      await this.categoriesRepository.remove(category);
    }
  }

  async createDefaultCategories(userId: string): Promise<Category[]> {
    const defaultCategories = [
      {
        name: 'Продукты питания',
        description: 'Расходы на еду и напитки',
        color: '#ff6b6b',
        icon: '🍕',
        isDefault: true,
      },
      {
        name: 'Транспорт',
        description: 'Расходы на транспорт',
        color: '#4ecdc4',
        icon: '🚗',
        isDefault: true,
      },
      {
        name: 'Развлечения',
        description: 'Расходы на развлечения',
        color: '#45b7d1',
        icon: '🎬',
        isDefault: true,
      },
      {
        name: 'Здоровье',
        description: 'Медицинские расходы',
        color: '#96ceb4',
        icon: '🏥',
        isDefault: true,
      },
      {
        name: 'Зарплата',
        description: 'Доходы от работы',
        color: '#feca57',
        icon: '💰',
        isDefault: true,
      },
      {
        name: 'Другое',
        description: 'Прочие расходы и доходы',
        color: '#a55eea',
        icon: '📦',
        isDefault: true,
      },
    ];

    const categories = defaultCategories.map(categoryData =>
      this.categoriesRepository.create({
        ...categoryData,
        userId,
      }),
    );

    return this.categoriesRepository.save(categories);
  }
}