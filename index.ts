import * as readline from 'readline-sync';

console.log("Welcome to the JSON data viewer!")
let choices : string[] = ["View all data", "Filter by ID"];

let index : number = readline.keyInSelect(choices, "Please enter your choice:");
console.log(`You chose ${choices[index]}.`);e