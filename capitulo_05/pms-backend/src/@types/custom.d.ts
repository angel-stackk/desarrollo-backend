// src/@types/custom.d.ts
import 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                user_id?: string;
                username?: string;
                email?: string;
                rights?: string[];
            };
        }
    }
}