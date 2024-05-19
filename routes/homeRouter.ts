import express from "express";
import { SortDirection } from "mongodb";
import { getBrand, getBrands, getModel, getModels, updateModel } from "../database";
import { Car } from "../interfaces";
import { secureMiddleware } from "../middleware/secureMiddleware";
export function homeRouter() {
    const router = express.Router();
    router.use('/models', secureMiddleware);
    router.use('/brands', secureMiddleware);
    router.use((req, res, next) => {
        res.locals.user = req.session.user;
        next();
    });
    router.get("/", secureMiddleware, async (req, res) => {
        res.render('index',
            {
                title: "Home"
            });
    });
    router.get('/models', async (req, res) => {
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
    router.get('/brands', async (req, res) => {
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
    router.get('/brand/:brandID', async (req, res) => {
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
    router.get('/model/:modelID', async (req, res) => {

        let ID = req.params.modelID.toUpperCase();
        try {
            let model = await getModel(ID);
            if (!model) {
                res.status(404).render("error", {
                    title: "Page not found",
                    message: "Page not found"
                });
                return;
            }
            res.render('model',
                {
                    title: model?.name || "Model niet gevonden",
                    model: model
                });
        } catch (error) {
            console.error('Error:', error);
        }
    })
    router.get('/model/:modelID/update', async (req, res) => {
        let user = req.session.user;
        if (!user || user.role != "ADMIN") {
            res.redirect('/models');
            return;
        }

        let ID = req.params.modelID.toUpperCase();

        let model = await getModel(ID);
        const title = model?.name + " - update" || "Model niet gevonden";
        res.render('model/update',
            {
                title: title,
                model: model
            });
    })
    router.post('/model/:modelID/update', async (req, res) => {
        let user = req.session.user;
        if (!user || user.role != "ADMIN") {
            res.redirect('/models');
            return;
        }
        let ID = req.params.modelID.toUpperCase();
        let model: Car = req.body;
        let concept_car: boolean = req.body.concept_car === "true";
        console.debug(model);
        model.concept_car = concept_car;
        await updateModel(ID, model);
        res.redirect('/models');
    })

    return router;
}