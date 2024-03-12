import express from "express";
import { Car } from './interfaces';
import { Brand } from './interfaces';
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
    let q:string = (typeof req.query.q === "string"?req.query.q:"");
    try {
        const response = await fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/cars.json');
        if (response.status === 404) throw new Error('Not found');
        if (response.status === 500) throw new Error('Internal server error');
        
        let cars: Car[] = await response.json();
        let filteredModes: Car[] = cars.filter((car)=>car.name.toLowerCase().startsWith(q.toLowerCase()));
        res.render('models',
        {
            title: "Models",
            cars: filteredModes,
            q:q
        });
        // if (index == 0) {
        //     cars.forEach(car => console.log(`- ${car.brand.name} - ${car.name} (${car.id})`));
        // }
        // else if (index == 1) {
        //     let Car_ID: string = readline.question("Please enter the ID you want to filter by (CAR-000): ");
        //     let carsearch: Car | undefined = cars.find((car) => car.id === Car_ID);
        //     if (carsearch != undefined) {
        //         console.log(carsearch)
        //     }
        //     else {
        //         console.log(`Er is geen model gevonden met ID: ${Car_ID}`)
        //     }
        // }
    } catch (error) {
        console.error('Error:', error);
    }

})
app.get('/brands', async(req, res) => {
    try {
        const response = await fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/brands.json');
        if (response.status === 404) throw new Error('Not found');
        if (response.status === 500) throw new Error('Internal server error');
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

app.listen(app.get('port'), () => console.log('[server] http://localhost:' + app.get('port')));

// async function main() {
//     console.log("Welcome to the JSON data viewer!")
//     // let choices: string[] = ["View all data", "Filter by ID"];
//     // let index: number = readline.keyInSelect(choices, "Please enter your choice:");
//     try {
//         const response = await fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/cars.json');
//         if (response.status === 404) throw new Error('Not found');
//         if (response.status === 500) throw new Error('Internal server error');
//         const cars: Car[] = await response.json();
//         // if (index == 0) {
//         //     cars.forEach(car => console.log(`- ${car.brand.name} - ${car.name} (${car.id})`));
//         // }
//         // else if (index == 1) {
//         //     let Car_ID: string = readline.question("Please enter the ID you want to filter by (CAR-000): ");
//         //     let carsearch: Car | undefined = cars.find((car) => car.id === Car_ID);
//         //     if (carsearch != undefined) {
//         //         console.log(carsearch)
//         //     }
//         //     else {
//         //         console.log(`Er is geen model gevonden met ID: ${Car_ID}`)
//         //     }
//         // }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }
// main();