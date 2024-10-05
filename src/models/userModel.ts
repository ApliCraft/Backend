import { Schema, model } from 'mongoose';

export interface IUserSchema {
    name: string,
    email: string,
    password: string,
    signInDate: Date,
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
    },
})

const User = model<IUserSchema>('User', UserSchema);
export default User;