import { NotFoundError, ValidationError } from "@repo/error-handler";

import { authRepository } from "../repositories/auth.repository";
import { AuthenticatedRequest } from "../types/auth.types";

export const addAddressForUser = async (
    req: AuthenticatedRequest,
    body: any
) => {
    const userId = req.user?.id;
    const { label, name, street, city, zip, country, isDefault } = body;

    if (!label || !name || !street || !city || !zip || !country) {
        throw new ValidationError("All fields are required");
    }

    if (isDefault) {
        await authRepository.clearDefaultAddresses(userId);
    }

    return authRepository.createAddress({
        userId,
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault,
    });
};

export const deleteAddressForUser = async (
    req: AuthenticatedRequest,
    addressId?: string
) => {
    const userId = req.user?.id;

    if (!addressId) {
        throw new ValidationError("Address ID is required");
    }

    const existingAddress = await authRepository.findAddressByIdForUser(
        addressId,
        userId
    );

    if (!existingAddress) {
        throw new NotFoundError("Address not found or unauthorized");
    }

    await authRepository.deleteAddress(addressId);
};

export const listUserAddresses = (req: AuthenticatedRequest) =>
    authRepository.findAddressesByUserId(req.user?.id);

export const addressService = {
    addAddressForUser,
    deleteAddressForUser,
    listUserAddresses,
};
