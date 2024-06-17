import { registerEnumType } from "@nestjs/graphql";

export enum ValidRoles {
    admin = 'admin',
    user = 'user', 
    super_user = 'superUser'
}

registerEnumType(ValidRoles, {
    name: 'ValidRoles',
    description: 'Valid roles for users'
})
