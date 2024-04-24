import { Collection, MongoClient } from "mongodb";
import { Brand, Car } from "./interfaces";
import dotenv from "dotenv";

dotenv.config();
export const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:1');
export const carCollection: Collection<Car> = client.db("project").collection<Car>("cars");
export const brandCollection: Collection<Brand> = client.db("project").collection<Brand>("brands");

async function exit() {
    try {
        await client.close();
        console.log('Disconnected from database');
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

async function seed() {
    if (await carCollection.countDocuments() === 0) {
        const carsApi = await fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/cars.json');
        console.log("CarsApi aangeroepen")
        if (carsApi.status === 404) throw new Error('Not found');
        if (carsApi.status === 500) throw new Error('Internal server error');
        if (carsApi.status === 400) throw new Error('Bad request');

        let cars: Car[] = await carsApi.json();
        await carCollection.insertMany(cars);
    }
    if (await brandCollection.countDocuments() === 0) {
        const modelApi = await fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/brands.json');
        console.log("ModelApi aangeroepen")
        if (modelApi.status === 404) throw new Error('Not found');
        if (modelApi.status === 500) throw new Error('Internal server error');
        if (modelApi.status === 400) throw new Error('Bad request');
        let brands: Brand[] = await modelApi.json();
        await brandCollection.insertMany(brands);
    }
}
// Modelen
export async function getModels(_searchString: string, _sortField: string, _sortDirection: number) {
    if (_searchString === "") {
        return await carCollection.find({}).sort({ [_sortField]: 1 }).toArray();
    }
    await carCollection.dropIndex("*")
    await carCollection.createIndex({ name: "text", "brand.name": "text" });
    return await carCollection.find({ $text: { $search: _searchString } }).sort({ _sortField: 1 }).toArray();
}
export async function getModel(_modelId: string) {
    return await carCollection.findOne({ id: _modelId });
}
// Merken
export async function getBrands() {
    return await brandCollection.find({}).toArray();
}
export async function getBrand(_brandId: string) {
    return await brandCollection.findOne({ id: _brandId });
}

export async function connect() {
    try {
        await client.connect();
        await seed();
        console.log('Connected to database');
        process.on('SIGINT', exit);
    } catch (error) {
        console.error(error);
    }
}