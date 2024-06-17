import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { ListItem } from './entities/list-item.entity';
import { List } from '../lists/entities/list.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ListItemService {

  constructor(
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>
  ) {}

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {

    try {
      const { listId, itemId, ...rest } = createListItemInput;

      const newListItem = this.listItemsRepository.create({
        ...rest,
        list: { id: listId },
        item: { id: itemId }
      });

      await this.listItemsRepository.save(newListItem);
      return this.findOne(newListItem.id);
      
    } catch (error) {
      throw new BadRequestException(error.detail);
    }
  }

  async findAll( list: List, paginationArgs: PaginationArgs, searchArgs: SearchArgs ): Promise<ListItem[]> {
    
    const { offset, limit } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemsRepository.createQueryBuilder('listItem')
      .innerJoinAndSelect('listItem.item', 'item')
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });
    
    if (search) queryBuilder.andWhere(`item.name ILIKE :search`, { search: `%${search}%` });

    return await queryBuilder.getMany();

  }

  async countListItemsByList( list: List ): Promise<number> {
    return await this.listItemsRepository.count({ where: { list }} );
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.listItemsRepository.findOneBy({ id });
    if(!listItem) throw new NotFoundException(`List Item with id ${id} not found`);
    return listItem;
  }

  async update(id: string, { listId, itemId, ...rest }: UpdateListItemInput): Promise<ListItem> {
    await this.listItemsRepository.createQueryBuilder()
      .update()
      .set({
        ...rest,
        ...(listId && { list: { id: listId } }),
        ...(itemId && { item: { id: itemId } })
      })
      .where('id = :id', { id })
      .execute();
  
    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }
}
