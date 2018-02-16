const fs = require('fs');
const minimist = require('minimist');
const trimLine = line => line.trim();
const filterEmptyLinesAndComments = line => line && line.substr(0, 2) !== '//'
const replaceStringLiteralsToJSON = line =>  line
                                            .replace(/"/g, '')
                                            .trim()
                                            .replace('=', ':');
const addCommas = (line, id, arr) => arr.length - 1 !== id ? line.replace(';', ',\n') : line.replace(';', '\n');
const splitOnDots = line => [line[0].split('.'), line.slice(1, line.length)];
const splitOnColons = line => line.split(':');
const groupInCategories = lines => {
    let tmp = '';
    let categoryObj = {};
    lines.map(lineArr => {
        const keys = lineArr[0];
        const value = lineArr[1][0];
        keys.reduce((acc, key, curId) => {
            if(keys.length - 1 === curId) {
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
    fs.readFile(args.i, 'utf8', (err, data) => {
        const lines = 
            data
            .split('\n')
            .map(trimLine)
            .filter(filterEmptyLinesAndComments)
            .map(replaceStringLiteralsToJSON)
            .map(addCommas)
            .map(splitOnColons)
            .map(splitOnDots);

        const jsonLocalization = JSON.stringify(groupInCategories(lines), null, 2);
        fs.writeFile(args.o, jsonLocalization, 'utf8', (err) => {
            if (err) throw err;
            console.log('file is saved ffs');
        })
    })
}
iosStringsToJson();