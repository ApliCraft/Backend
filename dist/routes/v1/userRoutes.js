"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../../controllers/userController");
const validate_1 = __importDefault(require("../../middleware/validate"));
const userValidator_1 = __importDefault(require("../../utils/validators/userValidator"));
const router = (0, express_1.Router)();
router.get("/getUser", (0, validate_1.default)(userValidator_1.default), userController_1.getUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map