import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            isAuthenticated?: boolean; // or the type that you expect
            tokenData?: any,
        }
    }
}
