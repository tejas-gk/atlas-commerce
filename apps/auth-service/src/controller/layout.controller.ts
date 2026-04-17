import { NextFunction, Request, Response } from "express";

import { getSiteLayout } from "../services/layout.service";

export const getLayoutData = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const layout = await getSiteLayout();
        res.status(200).json({
            success: true,
            layout,
        });
    } catch (error) {
        next(error);
    }
};
