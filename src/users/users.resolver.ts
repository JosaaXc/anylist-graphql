import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID, ResolveField, Int, Parent } from '@nestjs/graphql';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jtw-auth.guard';
import { User } from './entities/user.entity';

import { UpdateUserInput } from './dto/inputs/update-user.input';
import { ValidRolesArgs } from './dto/args/roles.arg';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { ItemsService } from '../items/items.service';
import { Item } from '../items/entities/item.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';
import { ListsService } from '../lists/lists.service';
import { List } from '../lists/entities/list.entity';

@Resolver(() => User)
@UseGuards( JwtAuthGuard )
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService
  ) {}

  @Query(() => [User], { name: 'users' })
  async findAll(
    @CurrentUser([ValidRoles.admin, ValidRoles.super_user]) user: User,
    @Args() validRoles: ValidRolesArgs, 
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
  ): Promise<User[]> {
    return this.usersService.findAll( validRoles.roles, paginationArgs, searchArgs );
  }

  @Query(() => User, { name: 'user' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe ) id: string, 
    @CurrentUser([ValidRoles.admin, ValidRoles.super_user]) user: User
  ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput, 
    @CurrentUser([ValidRoles.admin]) user: User
  ): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput, user);
  }

  @Mutation(() => User, { name: 'blockUser' })
  blockUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe ) id: string, 
    @CurrentUser([ValidRoles.admin]) user: User
  ): Promise<User> {
    return this.usersService.block(id, user);
  }

  @ResolveField( () => Int, { name: 'itemCount' })
  async itemCount(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User,
   ): Promise<Number>{
    return this.itemsService.itemCountByUser(user);
  }

  @ResolveField( () => Int, { name: 'listCount' })
  async listCount(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User,
   ): Promise<Number>{
    return this.listsService.listCountByUser(user);
  }

  @ResolveField( () => [Item], { name: 'items' })
  async getItemsByUser(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
   ): Promise<Item[]>{
    return this.itemsService.findAll( user, paginationArgs, searchArgs )
  }

  @ResolveField( () => [Item], { name: 'lists' })
  async getListsByUser(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
   ): Promise<List[]>{
    return this.listsService.findAll( user, paginationArgs, searchArgs )
  }

}
