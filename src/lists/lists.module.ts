import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsResolver } from './lists.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from './entities/list.entity';
import { ListItemModule } from '../list-item/list-item.module';

@Module({
  providers: [ListsResolver, ListsService],
  imports: [
    ListItemModule,
    TypeOrmModule.forFeature([
      List
    ])
  ],
  exports: [ 
    ListsService,
    TypeOrmModule
  ]
})
export class ListsModule {}
