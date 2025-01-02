import * as express from 'express';
import { Details } from 'express-useragent';

declare global {
    namespace Express {
        interface Request {
            isAuthenticated?: boolean; // or the type that you expect
            tokenData?: any,
            useragent?: Details;
        }
    }
}
