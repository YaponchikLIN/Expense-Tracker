import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким email уже существует',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход в систему',
  })
  @ApiResponse({
    status: 401,
    description: 'Неверные учетные данные',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление токенов доступа' })
  @ApiResponse({
    status: 200,
    description: 'Токены успешно обновлены',
  })
  @ApiResponse({
    status: 401,
    description: 'Недействительный refresh token',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({
    status: 200,
    description: 'Успешный выход из системы',
  })
  async logout(@GetUser() user: User) {
    await this.authService.logout(user.id);
    return { message: 'Успешный выход из системы' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение профиля текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя',
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  async getProfile(@GetUser() user: User) {
    return this.usersService.getProfile(user.id);
  }
}