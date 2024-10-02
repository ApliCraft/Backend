import { Schema, model, connect } from 'mongoose';

interface IUser {
    name: string,
    email: string,
}

const userSchema = new Schema<IUser>({
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
})

const User = model<IUser>('User', userSchema);
export default User;