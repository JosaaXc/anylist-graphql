import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { AuthResponse } from './types/auth-response.type';
import { UsersService } from '../users/users.service';
import { LoginInput, SignupInput } from './dto/inputs';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {

    constructor(
      private readonly userService: UsersService,
      private readonly jwtService: JwtService
    ) {}

    private getJWTToken( userId: string ): string {
      return this.jwtService.sign({ id: userId });
    }

    async signup( signupInput: SignupInput ): Promise<AuthResponse>{

      const user = await this.userService.create( signupInput );
      const token = this.getJWTToken( user.id );

      return { token, user }
    }

    async login( loginInput:LoginInput ): Promise<AuthResponse> {

      const { email, password } = loginInput;
      
      const user = await this.userService.findOneByEmail( email );
      
      if( !bcrypt.compareSync(password, user.password) )
        throw new BadRequestException('Email/Password invalid.');
      
      const token = this.getJWTToken( user.id );
      
      return {
        token,
        user
      }
    }

    async validateUser( id: string ): Promise<User> {
     
      const user = await this.userService.findOneById( id );

      if( user.isBlocked )
        throw new UnauthorizedException('User blocked, talk to the admin.');

      delete user.password;
      return user;

    }

    revalidateToken( user: User ): AuthResponse {
      const token = this.getJWTToken( user.id );
      return { token, user };
    }
}
