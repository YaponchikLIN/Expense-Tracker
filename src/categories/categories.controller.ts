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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Категории')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Создание новой категории' })
  @ApiResponse({
    status: 201,
    description: 'Категория успешно создана',
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoriesService.create(user.id, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение всех категорий пользователя' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Фильтр по активным категориям',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Список категорий',
  })
  findAll(@Query('active') active: string, @GetUser() user: User) {
    if (active === 'true') {
      return this.categoriesService.findActive(user.id);
    }
    return this.categoriesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение категории по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID категории',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Данные категории',
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
  })
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.categoriesService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление категории' })
  @ApiParam({
    name: 'id',
    description: 'ID категории',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно обновлена',
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
  })
  @ApiResponse({
    status: 403,
    description: 'Нельзя изменять системную категорию',
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: User,
  ) {
    return this.categoriesService.update(id, user.id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление категории' })
  @ApiParam({
    name: 'id',
    description: 'ID категории',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно удалена',
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
  })
  @ApiResponse({
    status: 403,
    description: 'Нельзя удалять системную категорию',
  })
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.categoriesService.remove(id, user.id);
    return { message: 'Категория успешно удалена' };
  }

  @Post('default')
  @ApiOperation({ summary: 'Создание категорий по умолчанию' })
  @ApiResponse({
    status: 201,
    description: 'Категории по умолчанию созданы',
  })
  createDefault(@GetUser() user: User) {
    return this.categoriesService.createDefaultCategories(user.id);
  }
}