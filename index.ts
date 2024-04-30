import express from "express";
import dotenv from "dotenv";
import { connect, getBrand, getBrands, getModel, getModels, updateModel } from "./database";
import { Car } from "./interfaces";
import { cwd } from "process";
import { SortDirection } from "mongodb";

dotenv.config();
const app = express();

app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));
app.use((req, res, next) => {
    res.locals.websitename = "Auto Haven";
    console.log(`${req.method} ${req.path}`);
    next();
});
app.get('/', (req, res) => {
    res.render('index',
        {
            title: "Home"
        });
})
app.get('/models', async (req, res) => {
    let q: string = (typeof req.query.q === "string" ? req.query.q : "");
    let sortField = typeof req.query.sortField === "string" ? req.query.sortField : "id";
    let sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "1";
    let direction: SortDirection = 1;
    let field: string = "id";
    if (sortDirection == "desc") {
        direction = -1
    }
    if (sortField === "date") {
        field = "date_first_produced";
    }
    if (sortField === "concept") {
        field = "concept_car";
    }
    if (sortField === "model") {
        field = "name"
    }

    try {
        let cars = await getModels(q, field, direction);
        res.render('models',
            {
                title: "Models",
                cars: cars,
                sortField: sortField,
                sortDirection: sortDirection,
                q: q
            });
    } catch (error) {
        console.error('Error:', error);
    }

})
app.get('/brands', async (req, res) => {
    try {
        let brands = await getBrands();
        res.render('brands',
            {
                title: "Brands",
                brands: brands
            });
    } catch (error) {
        console.error('Error:', error);
    }
})
app.get('/brand/:brandID', async (req, res) => {
    let ID = req.params.brandID.toUpperCase();
    try {
        let brand = await getBrand(ID);
        res.render('brand',
            {
                title: brand?.name || "Merk niet gevonden",
                brand: brand
            });
    } catch (error) {
        console.error('Error:', error);
    }
})
app.get('/model/:modelID', async (req, res) => {

    let ID = req.params.modelID.toUpperCase();
    try {
        let model = await getModel(ID);
        res.render('model',
            {
                title: model?.name || "Model niet gevonden",
                model: model
            });
    } catch (error) {
        console.error('Error:', error);
    }
})
app.get('/model/:modelID/update', async (req, res) => {

    let ID = req.params.modelID.toUpperCase();

    let model = await getModel(ID);
    const title = model?.name + " - update" || "Model niet gevonden";
    res.render('model/update',
        {
            title: title,
            model: model
        });
})
app.post('/model/:modelID/update', async (req, res) => {
    let ID = req.params.modelID.toUpperCase();
    let model: Car = req.body;
    let concept_car: boolean = req.body.concept_car === "true";
    console.log(model);
    model.concept_car = concept_car;
    await updateModel(ID, model);
    res.redirect('/models');
})
app.listen(app.get("port"), async () => {
    await connect();
    console.log("Server started on http://localhost:" + app.get('port'));
});