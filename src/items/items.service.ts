import { Injectable, NotFoundException } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';
import { User } from '../users/entities/user.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create( createItemInput: CreateItemInput, user: User ): Promise<Item> {
    const item = this.itemRepository.create({ ...createItemInput,user });
    return await this.itemRepository.save(item);
  }

  async findAll( user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs ): Promise<Item[]> {

    const { offset, limit } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.itemRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });
    
    if (search) queryBuilder.andWhere(`"name" ILIKE :search`, { search: `%${search}%` });

    return await queryBuilder.getMany();

  }

  async findOne( id: string, user: User ): Promise<Item> {
    const item = await this.itemRepository.findOneBy({id, user});
    if( !item ) throw new NotFoundException(`Item with id ${id} not found`);
    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput, user: User ): Promise<Item> {
    
    await this.findOne(id, user);
    const item = await this.itemRepository.preload( updateItemInput );
    if( !item ) throw new NotFoundException(`Item with id ${id} not found`);
    return await this.itemRepository.save(item);
    
  }

  async remove( id: string, user: User ) : Promise<Item>{
    //TODO: SOFT DELETE AND REFERENTIAL INTEGRITY
    const item = await this.findOne(id, user);
    await this.itemRepository.remove(item);
    return {...item, id};
  }

  async itemCountByUser(user: User): Promise<number> {
    return await this.itemRepository.count({ where: { user: { id: user.id} } });
  }
  
}
