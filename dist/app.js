"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
// Import routes
const userRoutes_1 = __importDefault(require("./routes/v1/userRoutes"));
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
app.get('/', (req, res) => {
    res.send('API running...');
});
exports.default = app;
//# sourceMappingURL=app.js.map