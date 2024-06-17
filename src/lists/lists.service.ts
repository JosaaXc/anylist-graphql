import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateListInput } from './dto/inputs/create-list.input';
import { UpdateListInput } from './dto/inputs/update-list.input';
import { List } from './entities/list.entity';
import { User } from '../users/entities/user.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ListsService {

  constructor(
    @InjectRepository(List)
    private listRepository: Repository<List>
  ) {}

  async create( createListInput: CreateListInput, user: User): Promise<List> {
    const newList = this.listRepository.create({ ...createListInput, user });
    return this.listRepository.save(newList);
  }

  async findAll( user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs ): Promise<List[]> {

    const { offset, limit } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });
    
    if (search) queryBuilder.andWhere(`"name" ILIKE :search`, { search: `%${search}%` });

    return await queryBuilder.getMany();

  }

  async findOne( id: string, user: User ): Promise<List> {
    const list = await this.listRepository.findOneBy({ id, user });
    if( !list ) throw new NotFoundException(`List with id ${id} not found`);
    return list;
  }

  async update(id: string, updateItemInput: UpdateListInput, user: User ): Promise<List> {
    
    await this.findOne(id, user);
    const item = await this.listRepository.preload( updateItemInput );
    if( !item ) throw new NotFoundException(`List with id ${id} not found`);
    return await this.listRepository.save(item);
    
  }

  async remove( id: string, user: User ) : Promise<List>{
    //TODO: SOFT DELETE AND REFERENTIAL INTEGRITY
    const list = await this.findOne(id, user);
    await this.listRepository.remove(list);
    return {...list, id};
  }

  async listCountByUser(user: User): Promise<number> {
    return await this.listRepository.count({ where: { user: { id: user.id} } });
  }
}
