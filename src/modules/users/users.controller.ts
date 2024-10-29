import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities';
import { UsersService } from './users.service';

@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  list(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
    return this.usersService.list(query);
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(updateUserDto);
  }

  @Get(':id(\\d+)')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Delete(':id(\\d+)')
  remove(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.remove(id);
  }

  @Delete(':id(\\d+)/soft')
  softRemove(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.softRemove(id);
  }

  @Get(':id(\\d+)/recover')
  recover(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.recover(id);
  }
}
