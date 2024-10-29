import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CurrentUser } from '~/common/decorators';
import { AuthGuard } from '~/modules/auth/guards';
import { User } from '../users/entities';
import { BindUserDto } from './dto';
import { WorkspacesService } from './workspaces.service';

@Controller({
  version: '1',
  path: 'workspaces',
})
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: User, @Body() createUserDto: any) {
    return this.workspacesService.create({ ...createUserDto, manager: user, users: [user] });
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Paginate() query: PaginateQuery) {
    return this.workspacesService.list(query);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: any) {
    return this.workspacesService.update(updateUserDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workspacesService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workspacesService.remove(id);
  }

  @Delete(':id/soft')
  @UseGuards(AuthGuard)
  softRemove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workspacesService.softRemove(id);
  }

  @Patch(':id/restore')
  @UseGuards(AuthGuard)
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.workspacesService.recover(id);
  }

  @Get(':id/users')
  @UseGuards(AuthGuard)
  users(@Param('id', ParseUUIDPipe) id: string, @Paginate() query: PaginateQuery) {
    return this.workspacesService.users(id, query);
  }

  @Post(':id/users/bind')
  @UseGuards(AuthGuard)
  bindUser(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User, @Body() bindUserDto: BindUserDto) {
    return this.workspacesService.bindUser(id, user, bindUserDto);
  }

  @Delete(':id/users/:userId/unbind')
  @UseGuards(AuthGuard)
  unbindUser(@Param('id', ParseUUIDPipe) id: string, @Param('userId', ParseUUIDPipe) userId: string, @CurrentUser() user: User) {
    return this.workspacesService.unbindUser(id, user, { id: userId });
  }
}
