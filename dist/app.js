"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const statusCodes_1 = require("./config/statusCodes");
// Import routes
const userRoutes_1 = __importDefault(require("./routes/v1/userRoutes"));
const errors_1 = require("./middleware/errors");
const app = (0, express_1.default)();
// let isConnectedToMongoDB = false;
//database connection
(0, db_1.default)();
// .then(
//   (isConnected) => {
//     isConnectedToMongoDB = isConnected;
//   }
// );
// Middleware setup
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Use the imported routes
app.use("/api/v1/users", userRoutes_1.default);
// Error handling middleware
app.use(errors_1.errorHandler);
app.get('/api', (_, res) => {
    res.status(statusCodes_1.HttpStatusCode.OK).json({
        info: 'API running...',
        api: ["/api/v1/users"]
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map