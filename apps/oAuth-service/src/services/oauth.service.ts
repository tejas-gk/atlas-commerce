import db from "@repo/db"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"

export const generateAuthCode = async ({
    clientId,
    redirectUri,
    userId,
}: {
    clientId: string
    redirectUri: string
    userId: string
}) => {
    const client = await db.oauth_clients.findUnique({
        where: { clientId },
    })

    if (!client) throw new Error("Invalid client")

    if (!client.redirectUris.includes(redirectUri)) {
        throw new Error("Invalid redirect URI")
    }

    const code = uuidv4()

    await db.oauth_codes.create({
        data: {
            code,
            clientId,
            userId,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
    })

    return code
}

export const exchangeToken = async ({
    code,
    clientId,
    clientSecret,
}: {
    code: string
    clientId: string
    clientSecret: string
}) => {
    const client = await db.oauth_clients.findUnique({
        where: { clientId },
    })

    if (!client || client.clientSecret !== clientSecret) {
        throw new Error("Invalid client")
    }

    const authCode = await db.oauth_codes.findUnique({
        where: { code },
    })

    if (!authCode) throw new Error("Invalid code")

    const accessToken = jwt.sign(
        { userId: authCode.userId },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "1h" }
    )

    const refreshToken = uuidv4()

    await db.oauth_tokens.create({
        data: {
            accessToken,
            refreshToken,
            userId: authCode.userId,
            clientId,
            expiresAt: new Date(Date.now() + 3600 * 1000),
        },
    })

    return {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
    }
}

export const getUserFromToken = async (token: string) => {
    const decoded: any = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
    )
    console.log("Decoded token:", decoded)
    const user = await db.users.findUnique({
        where: { id: decoded.userId },
    })

    return user
}