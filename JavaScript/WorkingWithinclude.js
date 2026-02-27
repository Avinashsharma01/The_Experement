let fruits = ["apple", "banana", "mango", "orange"];

console.log(fruits.includes("banana")); // true
console.log(fruits.includes("grape"));  // false

let sentence = "The quick brown fox jumps over the lazy dog.";

console.log(sentence.includes("quick")); // true
console.log(sentence.includes("cat"));   // false





// // syntax
// array.includes(element, start)
// string.includes(substring, start)


let numbers = [1, 2, 3, 4, 5];

console.log(numbers.includes(3, 3)); // false, because search starts at index 3
console.log(numbers.includes(3, 1)); // true, because search starts at index 1