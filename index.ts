import * as readline from 'readline-sync';
import { Car } from './interfaces';
let data = fetch('https://raw.githubusercontent.com/NoaBrecht/project-web-files/main/cars.json').then(response => response.json());

data.then(data=> {
    let array:Car[] = data;
})
const model: Car[] = Array;
console.log(model)