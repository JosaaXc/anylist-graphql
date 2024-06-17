import { InputType, Int, Field } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class CreateListInput {

  @Field( () => String )
  @IsString()
  @MinLength(3)
  name: string;

}
