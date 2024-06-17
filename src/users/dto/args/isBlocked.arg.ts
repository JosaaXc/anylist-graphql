import { ArgsType, Field } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@ArgsType()
export class IsBlockedArgs {
    
    @Field(() => Boolean, { nullable: true })
    @IsOptional()
    isBlocked: boolean = false;
    
}