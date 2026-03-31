import { Request, Response } from "express"
import {
    generateAuthCode,
    exchangeToken,
    getUserFromToken,
} from "../services/oauth.service"

export const authorize = async (req: Request, res: Response) => {
    const { client_id, redirect_uri, user_id } = req.query

    const code = await generateAuthCode({
        clientId: client_id as string,
        redirectUri: redirect_uri as string,
        userId: user_id as string,
    })

    return res.redirect(`${redirect_uri}?code=${code}`)
}

export const token = async (req: Request, res: Response) => {
    const { code, client_id, client_secret } = req.body

    const data = await exchangeToken({
        code,
        clientId: client_id,
        clientSecret: client_secret,
    })

    res.json(data)
}

export const userInfo = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1]
    
    const user = await getUserFromToken(token!)
    res.json(user)
}