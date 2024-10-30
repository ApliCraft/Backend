"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../../controllers/userController");
const validate_1 = require("../../middleware/validate");
const userValidator_1 = require("../../utils/validators/userValidator");
const router = (0, express_1.Router)();
router.get("/getUser", (0, validate_1.validate)(userValidator_1.GetUserValidatorSchema), userController_1.getUser);
router.post("/createUser", (0, validate_1.validate)(userValidator_1.CreateUserValidatorSchema), userController_1.createUser);
router.delete("/deleteUser", (0, validate_1.validate)(userValidator_1.GetUserValidatorSchema), userController_1.deleteUser);
router.put("/updateUser", (0, validate_1.validate)(userValidator_1.UpdateUserValidatorSchema), userController_1.updateUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map