import { Router } from "express"
import {
    authorize,
    token,
    userInfo,
} from "../controllers/oauth.controller"

const router = Router()

router.get("/authorize", authorize)
router.post("/token", token)
router.get("/userinfo", userInfo)

export default router