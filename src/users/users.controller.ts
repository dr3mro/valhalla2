import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  omitPassword(object: User): Omit<User, 'password'> {
    const { password: _password, ...userWithoutPassword } = object;
    return userWithoutPassword;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiBody({
    description: 'Add a new user',
    type: CreateUserDto,
    // This is used to generate the example in Swagger UI
    examples: {
      'Create User': {
        summary: 'Create a new user',
        value: {
          name: 'amr',
          email: 'amr@mail.com',
          password: 'A1#po!q2A',
          country: 'egypt',
          phone: '0123456123',
          role: 'ADMIN',
          dob: '1985-01-01',
        },
      },
    },
  })
  async create(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
    @Res() response: Response,
  ) {
    const result = await this.usersService.create(createUserDto);

    if (result instanceof Error) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: result.message,
      });
    }

    return response.status(HttpStatus.CREATED).json(this.omitPassword(result));
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users.' })
  findAll() {
    return this.usersService
      .findAll()
      .then((users) => users.map((user) => this.omitPassword(user)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Returns the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to retrieve',
    required: true,
    type: String,
  })
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const user = await this.usersService.findById(id);

    if (user instanceof Error) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: user.message });
    }

    return response.status(HttpStatus.OK).json(this.omitPassword(user));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by id' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to update',
    required: true,
    type: String,
  })
  @ApiBody({
    description: 'Update user details',
    type: UpdateUserDto,
    // This is used to generate the example in Swagger UI
    examples: {
      'Update User': {
        summary: 'Update an existing user',
        value: {
          name: 'amr',
          email: 'amr@mail.com',
          password: 'A1#po!q2A',
          country: 'egypt',
          phone: '0123456123',
          role: 'ADMIN',
          dob: '1985-01-01',
        },
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @Res() response: Response,
  ) {
    //TODO: updating password should be handled separately
    const result = await this.usersService.update(id, updateUserDto);

    if (result instanceof Error) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: result.message });
    }

    return response.status(HttpStatus.OK).json(this.omitPassword(result));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to delete',
    required: true,
    type: String,
  })
  async remove(@Param('id') id: string, @Res() response: Response) {
    const result = await this.usersService.remove(id);

    if (result instanceof Error) {
      return response.status(HttpStatus.NOT_FOUND).json({
        message: result.message,
      });
    }

    return response.status(HttpStatus.OK).send(result);
  }
}
