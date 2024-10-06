"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.Types.ObjectId,
        auto: true,
    },
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
});
const User = (0, mongoose_1.model)('User', UserSchema);
exports.default = User;
//# sourceMappingURL=userModel.js.map