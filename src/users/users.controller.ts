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
import { User } from '@prisma/client';
import { Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  omitPassword(object: User): Omit<User, 'password'> {
    const { password: _password, ...userWithoutPassword } = object;
    return userWithoutPassword;
  }

  @Post()
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
  findAll() {
    return this.usersService
      .findAll()
      .then((users) => users.map((user) => this.omitPassword(user)));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const user = await this.usersService.findOne(id);

    if (user instanceof Error) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: user.message });
    }

    return response.status(HttpStatus.OK).json(this.omitPassword(user));
  }

  @Patch(':id')
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
