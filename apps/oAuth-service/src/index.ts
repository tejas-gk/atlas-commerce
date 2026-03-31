import express from "express"
import dotenv from "dotenv"
import oauthRoutes from "./routes/oauth.routes"

dotenv.config()

const app = express()
app.use(express.json())

app.use("/oauth", oauthRoutes)

app.get("/", (req, res) => {
    res.send({ message: "Welcome to the OAuth Service" })
})

app.listen(4000, () => {
    console.log("OAuth service running on port 4000 🚀")
})