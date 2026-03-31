import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { DevLoginDto } from './dto/dev-login.dto';
import { BrowserLoginDto } from './dto/browser-login.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange a FiveM handshake key for a JWT' })
  login(@Body() dto: LoginDto) {
    console.log('Received login request with key:', dto);
    return this.auth.login(dto.key);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('browser-login')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Browser login: badge number verified against connected FiveM officers',
  })
  browserLogin(@Body() dto: BrowserLoginDto) {
    return this.auth.browserLogin(dto.badge);
  }

  @Public()
  @Post('dev-login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Dev-only: exchange identifier for a JWT (no handshake)',
  })
  devLogin(@Body() dto: DevLoginDto) {
    return this.auth.devLogin(dto.identifier);
  }
}
