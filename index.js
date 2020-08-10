const fs = require('fs');
const CheckSimilarity = require('./src/CheckSimilarity')

const masterFile = process.argv[2];
const compareFile = process.argv[3];

if (!fs.existsSync(masterFile) || !fs.existsSync(compareFile)) return console.log("Please, check the route files")

const checkSimilarity = new CheckSimilarity({masterFile, compareFile})
checkSimilarity.getResult()