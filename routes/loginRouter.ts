import express from "express";
import { User } from "../interfaces";
import { login } from "../database";
import { secureMiddleware } from "../middleware/secureMiddleware";

export function loginRouter() {
    const router = express.Router();

    router.get("/login", async (req, res) => {
        let user = req.session.user;
        if (user) {
            res.redirect("/");
            return;
        }
        res.render('login',
            {
                title: "Login",
            });
    });

    router.post("/login", async (req, res) => {

        const email: string = req.body.email;
        const password: string = req.body.password;
        try {
            let user: User = await login(email, password);
            delete user.password; // Remove password from user object. Sounds like a good idea.
            req.session.user = user;
            res.redirect("/")
        } catch (e: any) {
            res.redirect("/login");
        }
    });
    router.post("/logout", secureMiddleware, async (req, res) => {
        req.session.destroy((err) => {
            res.redirect("/login");
        });
    });

    return router;
}