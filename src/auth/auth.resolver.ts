import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jtw-auth.guard';
import { AuthResponse } from './types/auth-response.type';

import { SignupInput, LoginInput } from './dto/inputs';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ValidRoles } from './enums/valid-roles.enum';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Mutation( () => AuthResponse , { name: 'signup' })
  async signup(
    @Args('signupInput') signupInput: SignupInput
  ): Promise<AuthResponse>{
    return this.authService.signup( signupInput );
  }

  @Mutation( () => AuthResponse , { name: 'login' })
  async login(
    @Args('loginInput') loginInput: LoginInput
  ): Promise<AuthResponse>{
    return this.authService.login( loginInput );
  }

  @Query( () => AuthResponse , { name: 'revalidate'})
  @UseGuards( JwtAuthGuard )
  revalidateToken(
    @CurrentUser([ /**ValidRoles.ADMIN*/ ]) user: User
  ): AuthResponse{
    return this.authService.revalidateToken( user );
  }
  
}
