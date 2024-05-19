import express from "express";
import dotenv from "dotenv";
import { connect } from "./database";
import path from "path";
import { homeRouter } from "./routes/homeRouter";
import session from "./session";
import { loginRouter } from "./middleware/loginRouter";

dotenv.config();
const app = express();

app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, "views"));
app.use(session);
app.use((req, res, next) => {
    res.locals.websitename = "Auto Haven";
    console.log(`${req.method} ${req.path}`);
    next();
});


app.use(homeRouter());
app.use(loginRouter());

app.get('/register', async (req, res) => {
    res.render('register',
        {
            title: "Register",
        });
})
app.use((req, res, next) => {
    res.status(404).render("error", {
        title: "Page not found",
        message: "Page not found"
    });
});
app.listen(app.get("port"), async () => {
    try {
        await connect();
        console.log("Server started on http://localhost:" + app.get('port'));
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
});