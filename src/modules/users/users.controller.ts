import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from './entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

interface UserPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
}

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user's profile
   * GET /api/v1/users/profile
   */
  @Get('profile')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the profile information of the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getProfile(@CurrentUser() user: UserPayload): Promise<User> {
    return this.usersService.findOne(user.id);
  }

  /**
   * Update current user's profile
   * PATCH /api/v1/users/profile
   */
  @Patch('profile')
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Update the profile information of the currently authenticated user. Regular users cannot update role or isActive fields.',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async updateProfile(
    @CurrentUser() user: UserPayload,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // Regular users can only update their own non-role fields
    if (user.role !== Role.ADMIN) {
      delete updateUserDto.role;
      delete updateUserDto.isActive;
    }
    return this.usersService.update(user.id, updateUserDto);
  }

  /**
   * Change current user's password
   * PATCH /api/v1/users/password
   */
  @Patch('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change current user password',
    description:
      'Change the password of the currently authenticated user. Requires current password verification.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password changed successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or incorrect current password',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async changePassword(
    @CurrentUser() user: UserPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(user.id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  /**
   * Promote a user to ADMIN role
   * PATCH /api/v1/users/:email/promote-to-admin
   * ⚠️ TEMPORARY ENDPOINT FOR INITIAL SETUP - REMOVE IN PRODUCTION
   */
  @Patch(':email/promote-to-admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Promote user to ADMIN (Setup Only)',
    description:
      '⚠️ TEMPORARY: Promote a user to ADMIN role. Requires X-Admin-Secret header. Remove this endpoint after creating your first admin.',
  })
  @ApiParam({
    name: 'email',
    description: 'Email of the user to promote',
    type: String,
    example: 'admin@clinic.com',
  })
  @ApiResponse({
    status: 200,
    description: 'User promoted to ADMIN successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User promoted to ADMIN successfully' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', example: 'ADMIN' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Invalid admin secret',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async promoteToAdmin(
    @Param('email') email: string,
    @Body('adminSecret') adminSecret?: string,
  ): Promise<{ message: string; user: Partial<User> }> {
    // SECURITY CHECK: Require admin secret (set in .env or use default)
    const expectedSecret = process.env.ADMIN_SETUP_SECRET || 'CHANGE_ME_IN_PRODUCTION';
    
    if (adminSecret !== expectedSecret) {
      throw new HttpException(
        'Invalid admin secret. Set X-Admin-Secret header or adminSecret in body.',
        HttpStatus.FORBIDDEN,
      );
    }

    const promotedUser = await this.usersService.promoteToAdmin(email);
    
    return {
      message: 'User promoted to ADMIN successfully',
      user: {
        id: promotedUser.id,
        email: promotedUser.email,
        role: promotedUser.role,
        firstName: promotedUser.firstName,
        lastName: promotedUser.lastName,
      },
    };
  }

  /**
   * Get all users (Admin only)
   * GET /api/v1/users
   */
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all users (Admin only)',
    description: 'Retrieve a list of all active users in the system. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ADMIN role',
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  /**
   * Get a specific user by ID (Admin only)
   * GET /api/v1/users/:id
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get user by ID (Admin only)',
    description: 'Retrieve detailed information about a specific user by their ID. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ADMIN role',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  /**
   * Update a specific user (Admin only)
   * PATCH /api/v1/users/:id
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update user by ID (Admin only)',
    description:
      'Update any user information including role and active status. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ADMIN role',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Soft delete a user (Admin only)
   * DELETE /api/v1/users/:id
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user by ID (Admin only)',
    description:
      'Soft delete a user by setting their isActive status to false. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ADMIN role',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.softDelete(id);
  }
}
