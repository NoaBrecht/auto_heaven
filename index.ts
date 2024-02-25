import * as readline from 'readline-sync';
import { Car } from './interfaces';

let cars: Car[] = [];

fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/cars.json')
    .then(response => response.json())
    .then((data: Car[]) => {
        cars = data;
        cars.forEach(car => console.log(car.id));
    })
    .catch(error => console.error('Error:', error));
