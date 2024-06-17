import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { CreateUserInput } from './create-user.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { ValidRoles } from '../../../auth/enums/valid-roles.enum';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => [ValidRoles], { nullable: true })
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  roles?: ValidRoles[];

  @Field(()=> Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isBlocked?: boolean;
  
}
