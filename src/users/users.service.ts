import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SignupInput } from '../auth/dto/inputs/signup.input';
import { UpdateUserInput } from './dto/inputs/update-user.input';

import { User } from './entities/user.entity';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { PaginationArgs } from '../common/dto/args/pagination.args';
import { SearchArgs } from '../common/dto/args/search.args';

@Injectable()
export class UsersService {

  private logger: Logger = new Logger('UsersService');
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create( signupInput: SignupInput ): Promise<User>{
    try {
      
      const user = this.userRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10)
      });
      return await this.userRepository.save(user);

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll( roles: ValidRoles[], paginationArgs: PaginationArgs, searchArgs: SearchArgs ): Promise<User[]> {

    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    try {
    
      const queryBuilder = this.userRepository.createQueryBuilder()
        .take(limit)
        .skip(offset);
      
      if( roles.length > 0 ) queryBuilder.andWhere('roles @> :roles', { roles });
      if( search ) queryBuilder.andWhere('"fullName" ILIKE :search or email ILIKE :search', { search: `%${search}%` });

      return await queryBuilder.getMany();

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findOneByEmail( email: string ): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail( { email } );
    } catch (error) {
      this.handleDBErrors({
        code: 'error-001',
        detail: `User with email ${email} not found.`
      });
    }
  }
  async findOneById(id: string) {
    try {
      return await this.userRepository.findOneByOrFail({ id });
    } catch (error) {
      this.handleDBErrors({
        code: 'error-001',
        detail: `User with email ${ id } not found.`
      });
    }
  }

  
  async update(
    id: string, 
    updateUserInput: UpdateUserInput,
    updateBy: User
  ): Promise<User> {
    try {

      const userToUpdate = await this.userRepository.preload({
        ...updateUserInput,
        id
      });
      userToUpdate.lastUpdateBy = updateBy;
      return await this.userRepository.save(userToUpdate);
      
    } catch (error) {
      this.handleDBErrors(error);
    }
  }
  
  async block( id: string, adminUser: User ): Promise<User> {

    const userToBlock = await this.findOneById(id);
    userToBlock.isBlocked = true;
    userToBlock.lastUpdateBy = adminUser;
    return await this.userRepository.save(userToBlock);
    
  }

  private handleDBErrors(error: any): never {

    if (error.code === '23505') 
      throw new BadRequestException( error.detail );
      
    if (error.code === 'error-001') 
      throw new BadRequestException( error.detail );

    this.logger.error(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
