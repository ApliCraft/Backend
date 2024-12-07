import { Schema, model, Types } from 'mongoose';

export interface IUserSchema {
    _id?: string,
    name: string,
    email: string,
    password: string,
    isActive: boolean,
    signInDate?: Date,
    lastLoginDate: Date,
}

const UserSchema = new Schema<IUserSchema>({
    _id: {
        type: Types.ObjectId,
        auto: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
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
        auto: true,
    },
    isActive: {
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