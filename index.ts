import express from "express";
import { Car } from './interfaces';
import { Brand } from './interfaces';
import { error } from "console";
const app = express();

app.set('view engine', 'ejs'); // EJS als view engine
app.set('port', 3000);

app.get('/', (req, res) => {
    res.render('index',
        {
            title: "Home"
        });
})
app.get('/models', async (req, res) => {
    let q: string = (typeof req.query.q === "string" ? req.query.q : "");
    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
    try {
        const response = await fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/cars.json');
        if (response.status === 404) throw new Error('Not found');
        if (response.status === 500) throw new Error('Internal server error');

        let cars: Car[] = await response.json();
        let filteredModels: Car[] = cars.filter((car) => car.name.toLowerCase().startsWith(q.toLowerCase()));
        let sortedModels = [...filteredModels].sort((a, b) => {
            if (sortField === "model") {
                return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            } else if (sortField === "date") {
                return sortDirection === "asc" ? new Date(a.date_first_produced).getTime() - new Date(b.date_first_produced).getTime() : new Date(b.date_first_produced).getTime() - new Date(a.date_first_produced).getTime();
            } else if (sortField === "type") {
                return sortDirection === "asc" ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
            } else if (sortField === "concept") {
                return sortDirection === "asc" ? Number(b.concept_car) - Number(a.concept_car) : Number(a.concept_car) - Number(b.concept_car);
            } else {
                return 0;
            }
        });
        res.render('models',
            {
                title: "Models",
                cars: sortedModels,
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
        const response = await fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/brands.json');
        if (response.status === 404) throw new Error('Not found');
        if (response.status === 500) throw new Error('Internal server error');
        if (response.status === 400) throw new Error('Bad request');
        let brands: Brand[] = await response.json();
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
    let ID = req.params.brandID;

    try {
        const response = await fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/brands.json');
        if (response.status === 404) throw new Error('Not found');
        if (response.status === 500) throw new Error('Internal server error');
        let errorcode = response.status;
        let brands: Brand[] = await response.json();
        let filteredBrands: Brand[] = brands.filter((brand) => brand.id === ID);
        let brand: Brand | undefined = filteredBrands[0];
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
    let ID = req.params.modelID;

    try {
        const response = await fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/cars.json');
        if (response.status === 404) throw new Error('Not found');
        if (response.status === 500) throw new Error('Internal server error');
        let errorcode = response.status;

        let cars: Car[] = await response.json();
        let filteredModel: Car[] = cars.filter((model) => model.id === ID);
        let model: Car | undefined = filteredModel[0];

        res.render('model',
            {
                title: model?.name || "Model niet gevonden",
                model: model
            });
    } catch (error) {
        console.error('Error:', error);
    }
})

app.listen(app.get('port'), () => console.log('[server] http://localhost:' + app.get('port')));