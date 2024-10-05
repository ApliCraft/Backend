"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const UserValidatorSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(30),
    password: zod_1.z.string().min(8).max(30),
    email: zod_1.z.string().email(),
});
exports.default = UserValidatorSchema;
//# sourceMappingURL=userValidator.js.map