import UserSchema, { IUserSchema } from "../models/userModel";

// Searches database for user with email | name then return user data or null if user not found
// Errors must be handled outside the function (try/catch block)
export async function searchUser(userName?: string | undefined, userEmail?: string | undefined): Promise<IUserSchema | null> {
    const userData = await UserSchema.findOne({
        $or: [
            { email: userEmail },
            { name: userName }
        ]
    });

    if (userData) {
        return userData;
    }

    return null;
}
