import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ItemsModule } from '../items/items.module';
import { ListsModule } from '../lists/lists.module';

@Module({
  providers: [UsersResolver, UsersService],
  imports: [
    ItemsModule,
    ListsModule,
    TypeOrmModule.forFeature([ 
      User
    ])
  ], 
  exports: [
    TypeOrmModule,
    UsersService,
  ]
})
export class UsersModule {}
