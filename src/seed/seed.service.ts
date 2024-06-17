import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';

import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { List } from '../lists/entities/list.entity';
import { ListItem } from '../list-item/entities/list-item.entity';

import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ListsService } from '../lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';
import { of } from 'rxjs';

@Injectable()
export class SeedService {

    private isProd: boolean; 

    constructor(

        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,
        
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        
        @InjectRepository(ListItem)
        private readonly listItemsRepository: Repository<ListItem>,
        
        @InjectRepository(List)
        private readonly listsRepository: Repository<List>,
        
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
        private readonly listsService: ListsService,
        private readonly listItemsService: ListItemService,
    ) {
        this.isProd = this.configService.get('STATE') === 'prod';
    }
    
    async executeSeed(): Promise<boolean> {
        
        if( this.isProd ) throw new UnauthorizedException('You cannot seed the database in production mode');
        // Clean up the database
        await this.deleteDatabese();
        // Create users 
        const users: User[] = await this.loadUsers();
        // Create items
        const items = await this.loadItems(users);
        // Create lists
        const lists: List[] = await this.loadLists( users )
        // Create list items
        await this.loadListItems( lists, items );
        return true;
    }

    async deleteDatabese() {
        await this.listItemsRepository.createQueryBuilder().delete().where({}).execute();
        await this.listsRepository.createQueryBuilder().delete().where({}).execute();
        await this.itemRepository.createQueryBuilder().delete().where({}).execute();
        await this.userRepository.createQueryBuilder().delete().where({}).execute();
    }

    async loadUsers(): Promise<User[]> {
        const users = []
        for( const user of SEED_USERS ) {
            users.push( await this.usersService.create(user) );
        }
        return users;
    }

    async loadItems( users: User[] ): Promise<Item[]> {
        const items = [];
        for ( const item of SEED_ITEMS ) {
            const ramdomUser = Math.floor( Math.random() * users.length );
            const user = users[ramdomUser];
            items.push( await this.itemsService.create( item, user ) );
        }
        Promise.all(items);
        return items;
    }

    async loadLists( users: User[] ): Promise<List[]> {
        const list = [];
        for ( const item of SEED_LISTS ) {
            const ramdomUser = Math.floor( Math.random() * users.length );
            const user = users[ramdomUser];
            list.push( await this.listsService.create( item, user ) );
        }
        Promise.all(list);
        return list;
    }

    async loadListItems( lists: List[], items: Item[] ) { 
        for( const list of lists ) { 
            for( const item of items ) { 
                await this.listItemsService.create({ 
                    quantity: Math.floor( Math.random() * 10 ), 
                    completed: Math.random() > 0.5, 
                    listId: list.id, 
                    itemId: item.id 
                }); 
            } 
        } 
    }
    
}
