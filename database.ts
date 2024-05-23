import { Collection, MongoClient, SortDirection } from "mongodb";
import { Brand, Car, User } from "./interfaces";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
export const client = new MongoClient(MONGODB_URI);

export const carCollection: Collection<Car> = client.db("project").collection<Car>("cars");
export const brandCollection: Collection<Brand> = client.db("project").collection<Brand>("brands");
export const userCollection: Collection<User> = client.db("project").collection<User>("users");
const saltRounds: number = 10;

async function exit() {
    try {
        await client.close();
        console.log('Disconnected from database');
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}
async function createInitialUser() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let email: string | undefined = process.env.ADMIN_EMAIL;
    let password: string | undefined = process.env.ADMIN_PASSWORD;
    if (email === undefined || password === undefined) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
    }
    await userCollection.insertOne({
        email: email,
        password: await bcrypt.hash(password, saltRounds),
        role: "ADMIN"
    });
}
async function seed() {
    if (await carCollection.countDocuments() === 0) {
        const carsApi = await fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/cars.json');
        console.log("ModelAPI aangeroepen")
        if (carsApi.status === 404) throw new Error('Not found');
        if (carsApi.status === 500) throw new Error('Internal server error');
        if (carsApi.status === 400) throw new Error('Bad request');

        let cars: Car[] = await carsApi.json();
        await carCollection.insertMany(cars);
    }
    if (await brandCollection.countDocuments() === 0) {
        const modelApi = await fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/brands.json');
        console.log("BrandAPI aangeroepen")
        if (modelApi.status === 404) throw new Error('Not found');
        if (modelApi.status === 500) throw new Error('Internal server error');
        if (modelApi.status === 400) throw new Error('Bad request');
        let brands: Brand[] = await modelApi.json();
        await brandCollection.insertMany(brands);
    }
}
// Modelen
export async function getModels(_searchString: string, _sortField: string, _sortDirection: SortDirection) {

    if (_searchString === "") {
        return await carCollection.find({}).sort({ [_sortField]: _sortDirection }).toArray();
    }
    await carCollection.dropIndex("*")
    await carCollection.createIndex({ name: "text", "brand.name": "text" });
    return await carCollection.find({ $text: { $search: _searchString } }).sort({ [_sortField]: _sortDirection }).toArray();


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
export async function updateModel(id: string, name: string, description: string, topspeed: number, date_first_produced: Date, type: string) {
    return await carCollection.updateOne({ id: id }, { $set: { name: name, description: description, topspeed: topspeed, date_first_produced: date_first_produced, type: type } });
}
//users
export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email and password required");
    }
    let user: User | null = await userCollection.findOne<User>({ email: email });
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}
export async function registerUser(email: string, password: string, role: "ADMIN" | "USER") {
    password = await bcrypt.hash(password, saltRounds)
    let existingUser: User | null = await userCollection.findOne<User>({ email: email })
    if (existingUser) {
        return { error: "User already exists" }
    }
    let user: User = {
        email: email, password: password, role: role
    }
    return await userCollection.insertOne(user)
}
export async function connect() {
    try {
        await client.connect();
        await seed();
        await createInitialUser();
        console.log('Connected to database');
        process.on('SIGINT', exit);
    } catch (error) {
        console.error(error);
    }
}
