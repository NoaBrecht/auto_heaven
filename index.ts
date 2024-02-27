import * as readline from 'readline-sync';
import { Car } from './interfaces';
console.log("Welcome to the JSON data viewer!")
let choices: string[] = ["View all data", "Filter by ID"];
let ID_found: boolean;
let index: number = readline.keyInSelect(choices, "Please enter your choice:");
async function main() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/cars.json');
        const cars: Car[] = await response.json();
        if (index == 0) {
            cars.forEach(car => console.log(`- ${car.brand.name} - ${car.name} (${car.id})`));
        }
        else if (index == 1) {
            let Car_ID: string = readline.question("Please enter the ID you want to filter by (CAR-000): ");
            cars.forEach(car => {
                if (car.id == Car_ID) {
                    console.log(car);
                    ID_found = true;
                }
            });
            if (!ID_found) {
                console.log(`Er is geen model gevonden met ID: ${Car_ID}`)
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
main();
export {}