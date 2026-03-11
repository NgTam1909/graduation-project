export interface RegisterInput {
    firstName: string
    lastName: string
    phone: string
    email: string
    password: string
}

export interface LoginInput {
    email: string
    password: string
}

export interface UserResponse {
    id: string
    firstName: string
    lastName: string
    email: string
}