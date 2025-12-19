import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Find all active users
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find a user by ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Create a new user
   */
  async create(registerDto: RegisterDto): Promise<User> {
    const { email, password, firstName, lastName, phone, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      // Create new user entity
      const user = this.usersRepository.create({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        phone,
        role,
      });

      // Save user (password will be hashed by @BeforeInsert hook)
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Update a user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Update only provided fields
    Object.keys(updateUserDto).forEach((key) => {
      if (updateUserDto[key] !== undefined) {
        user[key] = updateUserDto[key];
      }
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  /**
   * Soft delete a user (set isActive to false)
   */
  async softDelete(id: string): Promise<User> {
    const user = await this.findOne(id);

    user.isActive = false;

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  /**
   * Validate user password
   */
  async validateUserPassword(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.findByEmail(email);

    if (user && (await user.validatePassword(password))) {
      return user;
    }

    return null;
  }

  /**
   * Change user password with current password verification
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user
    const user = await this.findOne(userId);

    // Verify current password
    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Prevent using same password
    const isSamePassword = await user.validatePassword(newPassword);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Update password using entity method (ensures proper hashing)
    user.setPassword(newPassword);

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to change password');
    }
  }

  /**
   * Promote a user to ADMIN role by email
   * SECURITY: Should only be used during initial setup
   */
  async promoteToAdmin(email: string): Promise<User> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }

    // Update role to ADMIN
    user.role = 'ADMIN' as any; // Cast to handle Role enum

    try {
      const updatedUser = await this.usersRepository.save(user);
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Failed to promote user to admin');
    }
  }
}
