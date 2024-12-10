import UserSchema, { UserType } from "../models/userModel";

// Searches database for user with email | name then return user data or null if user not found
// Errors must be handled outside the function (try/catch block)
export async function searchUser(userEmail?: string | undefined, userName?: string | undefined): Promise<UserType | null> {
    const userData = await UserSchema.findOne({
        $or: [
            { email: userEmail },
            { username: userName }
        ]
    });

    return userData;
}
