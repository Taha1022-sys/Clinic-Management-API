import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  tokenType: string;
  expiresIn: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Create the user (password is hashed in the entity's @BeforeInsert hook)
    const user = await this.usersService.create(registerDto);

    // Generate JWT token
    const accessToken = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '1h',
    };
  }

  /**
   * Login user and return JWT token
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Validate user credentials
    const user = await this.usersService.validateUserPassword(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    // Generate JWT token
    const accessToken = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '1h',
    };
  }

  /**
   * Generate JWT token for user
   */
  generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User): Partial<User> {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
