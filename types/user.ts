import mongoose from "mongoose"
export interface IUser {
    _id: string
    firstName: string
    lastName: string
    phone: string
    email: string
    position?: string
    skills: string[]
    address?: Array<{ _id: string; street?: string; city?: string }>
    isGod: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
}
export type PopulatedUser = {
    _id: mongoose.Types.ObjectId
    firstName?: string
    lastName?: string
    email?: string
}