export class UserDto {
    id: any
    email: any
    password: any
    name: any
    isActivated: any
    constructor(model: {
        _id: any, email: any, password: any, name: any, isActivated: any, id: any
    }) {
        this.email = model.email
        this.name = model.name
        this.id = model._id
        this.password = model.password
        this.isActivated = model.isActivated
    }
}