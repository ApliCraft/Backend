import { Schema, model } from 'mongoose';

export interface IUserSchema {
    name: string,
    email: string,
    password: string,
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
    }
})

const User = model<IUserSchema>('User', UserSchema);
export default User;