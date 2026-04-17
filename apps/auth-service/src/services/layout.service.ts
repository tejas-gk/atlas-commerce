import { authRepository } from "../repositories/auth.repository";

export const getSiteLayout = () => authRepository.findLayout();

export const layoutService = {
    getSiteLayout,
};
