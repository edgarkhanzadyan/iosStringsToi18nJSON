const fs = require('fs');
const minimist = require('minimist');
const chalk = require('chalk');

// trim
const trimLine = line => line.trim();
const trimLineArray = lineArr => lineArr.map(trimLine);

const filterEmptyLinesAndComments = line => line && line.substr(0, 2) !== '//';

const replaceQuotations = line =>  line.replace(/"/g, '');

const deletePercentageCharacters = line => line.replace(/%[a-zA-Z@.\d]*/, '');

const deleteSemicolons = line => line.replace(';', '');

const splitOnDots = line => [line[0].split('.'), line[1]];

const splitOnEquals = line => line.split('=');

const trace = line => (console.log(line), line);

const groupInCategories = lines => {
    let tmp = '';
    let categoryObj = {};
    lines.map(lineArr => {
        const keys = lineArr[0];
        const value = lineArr[1];
        keys.reduce((acc, key, i) => {
            if(keys.length - 1 === i) {
                acc[key] = value;
            } else if(!acc[key]) {
                acc[key] = {};
            }
            return acc[key];
        }, categoryObj)
    })
    return categoryObj;
}


const iosStringsToJson = () => {
    const args = minimist(process.argv.slice(2));
    if (!args.i) {
        const message = chalk.red('You have to provide input file with -i (e.g. -i path/to/input/file.strings)');
        console.error(message);
        process.exit(-1);
    }
    if (!args.o) {
        const message = chalk.red('You have to provide output file with -i (e.g. -i path/to/output/file.strings)');
        console.error(message);
        process.exit(-1);
    }
    console.log(chalk.cyan(`reading file from ${args.i}`));
    fs.readFile(args.i, 'utf8', (err, data) => {
        if (err) {
            const message = chalk.red(err);
            console.error(message);
            process.exit(-1);
        }
        const lines = 
            data
            .split('\n') // array of lines
            .filter(filterEmptyLinesAndComments) // array of lines with only valuable info
            .map(deleteSemicolons) // array of lines without semicolons
            .map(replaceQuotations) // array of lines with json
            .map(deletePercentageCharacters) // delete swift percentage characters
            .map(splitOnEquals) // array of arrays of 2 strings (left part - key, right part - value)
            .map(trimLineArray) // trim strings in small arrays
            .map(splitOnDots) // array of arrays. array[0] is an array of keys, array[1] is a value

        const jsonLocalization = groupInCategories(lines)
        const stringifiedJSON = JSON.stringify(jsonLocalization, null, 2);
        fs.writeFile(args.o, stringifiedJSON, 'utf8', (err) => {
            if (err) {
                const message = chalk.red(err);
                console.error(message);
                process.exit(-1);
            }
            const message = chalk.green(`file is saved at ${args.o}`)
            console.log(message);
        })
    })
}
iosStringsToJson();