import { Schema, model, Types, InferSchemaType, Document } from 'mongoose';

// Define the schema
const UserSchema = new Schema({
    _id: {
        type: Types.ObjectId,
        auto: true,
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    signInDate: {
        type: Date,
        default: new Date(),
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    lastLoginDate: Date,
    jwtToken: { type: String },
    refreshToken: { type: String },
    passwordResetToken: { type: String },
    loginAttempts: { type: Number, default: 0 },
    isEmailVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String },

    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: Date,
    gender: { type: String },
    profilePicture: String,
    bio: String,
    location: String,
    phoneNumber: {
        type: String,
    },

    accountStatus: { type: String, default: 'active' },
    roles: { type: [String], default: ['user'] },
    passwordLastChangedAt: Date,
    languagePreference: { type: String, default: 'en' },
    themePreference: { type: String, default: "light" },
    notificationPreferences: { type: Map, of: Boolean },
    timezone: { type: String, default: "UTC" },
    privacySettings: { type: Map, of: Boolean },
    contentPreferences: { type: [String], default: [] },

    activityLogs: { type: [String], default: [] },
    searchHistory: { type: [String], default: [] },

    savedItems: { type: [String], default: [] },

    paymentMethods: { type: [String], default: [] },
    billingAddress: { type: String },
    transactionHistory: { type: [String], default: [] },
    subscriptionPlan: { type: String },

    friendsList: { type: [Types.ObjectId], default: [] },
    followers: { type: [Types.ObjectId], default: [] },
    messages: { type: [Types.ObjectId], default: [] },
    groups: { type: [Types.ObjectId], default: [] },

    auditLogs: { type: [String], default: [] },

    termsAcceptedAt: { type: Date },
    privacyPolicyAcceptedAt: { type: Date },
    gdprConsent: { type: Boolean, default: false },
    ageVerification: { type: Boolean, default: false },

    // integration with products
    likedRecipes: { type: [Types.ObjectId], default: [], ref: "Recipe" }
});

export type UserType = InferSchemaType<typeof UserSchema> & Document;
const User = model<UserType>('User', UserSchema);
export default User;