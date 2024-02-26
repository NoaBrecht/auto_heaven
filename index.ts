import * as readline from 'readline-sync';
import { Car } from './interfaces';
let cars: Car[] = [];
console.log("Welcome to the JSON data viewer!")
let choices: string[] = ["View all data", "Filter by ID"];
let ID_found: boolean;

let index: number = readline.keyInSelect(choices, "Please enter your choice:");
fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/cars.json')
    .then(response => response.json())
    .then((data: Car[]) => {
        cars = data;
        // cars.forEach(car => console.log(car));
        if (index == 0) {
            cars.forEach(car => console.log(`- ${car.name} (${car.id})`));
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
    })
    .catch(error => console.error('Error:', error));