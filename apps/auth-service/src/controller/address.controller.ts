import { NextFunction, Response } from "express";

import {
    addAddressForUser,
    deleteAddressForUser,
    listUserAddresses,
} from "../services/address.service";
import { AuthenticatedRequest } from "../types/auth.types";

export const addUserAddress = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const address = await addAddressForUser(req, req.body);
        res.status(201).json({
            success: true,
            address,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUserAddress = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const addressId = Array.isArray(req.params.addressId)
            ? req.params.addressId[0]
            : req.params.addressId;

        await deleteAddressForUser(req, addressId);
        res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const getUserAddresses = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const addresses = await listUserAddresses(req);
        res.status(200).json({
            success: true,
            addresses,
        });
    } catch (error) {
        next(error);
    }
};
