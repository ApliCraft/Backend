import { Schema, model } from 'mongoose';

export interface IUserSchema {
    _id?: string,
    name: string,
    email: string,
    password: string,
    active: boolean,
    signInDate: Date,
    lastLoginDate: Date,
}

const UserSchema = new Schema<IUserSchema>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    signInDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
        required: true,
    },
    lastLoginDate: {
        type: Date,
        default: Date.now,
        required: true,
    }
})

const User = model<IUserSchema>('User', UserSchema);
export default User;