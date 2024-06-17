import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';

import { JwtAuthGuard } from '../auth/guards/jtw-auth.guard';

import { List } from './entities/list.entity';
import { ListItem } from '../list-item/entities/list-item.entity';
import { User } from '../users/entities/user.entity';

import { PaginationArgs, SearchArgs } from '../common/dto/args';
import { CreateListInput } from './dto/inputs/create-list.input';
import { UpdateListInput } from './dto/inputs/update-list.input';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ListsService } from './lists.service';
import { ListItemService } from '../list-item/list-item.service';

@Resolver(() => List)
@UseGuards( JwtAuthGuard )
export class ListsResolver {
  constructor(
    private readonly listsService: ListsService,
    private readonly listItemsService: ListItemService
  ) {}

  @Mutation(() => List)
  async createList(
    @CurrentUser() user: User,
    @Args('createListInput') createListInput: CreateListInput
  ): Promise<List> {
    return this.listsService.create( createListInput, user );
  }

  @Query(() => [List], { name: 'lists' })
  async findAll(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
  ): Promise<List[]> {
    return this.listsService.findAll( user, paginationArgs, searchArgs );
  }

  @Query(() => List, { name: 'list' })
  async findOne(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }, ParseUUIDPipe ) id: string
  ): Promise<List> {
    return this.listsService.findOne( id, user );
  }

  @Mutation(() => List)
  async updateList(
    @CurrentUser() user: User,
    @Args('updateListInput') updateListInput: UpdateListInput
  ): Promise<List> {
    return this.listsService.update(updateListInput.id, updateListInput, user );
  }

  @Mutation(() => List)
  removeList(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }, ParseUUIDPipe ) id: string
  ) {
    return this.listsService.remove( id, user );
  }

  @ResolveField( ()=> [ListItem], { name: 'items' })
  async getListItems(
    @Parent() list: List,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
    ): Promise<ListItem[]> {
      return this.listItemsService.findAll( list, paginationArgs, searchArgs );
      }
      
  @ResolveField( ()=> Number, { name: 'totalItems' })
  async countListItemsByList( 
    @Parent() list: List 
  ): Promise<number> {
    return this.listItemsService.countListItemsByList( list );
  }

}
