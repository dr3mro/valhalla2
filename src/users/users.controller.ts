import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

    return response.status(HttpStatus.CREATED).json(result);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ) {
    const user = await this.usersService.findOne(id);

    if (user instanceof Error) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: user.message });
    }

    return response.status(HttpStatus.OK).json(user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
