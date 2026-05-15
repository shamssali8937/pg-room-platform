declare namespace Express {
    export interface Request {
        /** Decoded JWT payload attached by the authenticate middleware. */
        user?: {
            id: string;
            role: string;
            iat?: number;
            exp?: number;
        };

        /** Unique request ID injected by requestIdMiddleware, used for log correlation. */
        requestId?: string;
    }
}