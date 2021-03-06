export interface User {
    userType:string,
    name:string,
    password:string,
    email:string,
    newEmail:string, 
    phoneNumber:string, 
    favourites:string[],
    notifications:string[],
    tokens:string[],
    otp:string,
    activated:boolean, 
    addresses:[ 
        {
            addrType:string,
            addrContent:string,
            isDefault:boolean
        }
    ],
    avatar:string
}
