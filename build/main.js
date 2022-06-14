var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import fs from 'fs';
import readline from 'readline';
import munkres from 'munkres-js';
const { drivers, destinations } = await readDriversAndDestinations();
const { totalScore, assignments } = getScoreAndMakeAssignments(drivers, destinations);
displayOutput(totalScore, assignments);
async function readDriversAndDestinations() {
    const destinationsFilePath = './Data/Input/Destinations.txt';
    const driversFilePath = './Data/Input/Drivers.txt';
    const destinations = await getContents(destinationsFilePath);
    const drivers = await getContents(driversFilePath);
    return { drivers, destinations };
}
async function getContents(filepath) {
    var e_1, _a;
    const listIterable = readline.createInterface({
        input: fs.createReadStream(filepath),
        crlfDelay: Infinity
    });
    const contents = [];
    try {
        for (var listIterable_1 = __asyncValues(listIterable), listIterable_1_1; listIterable_1_1 = await listIterable_1.next(), !listIterable_1_1.done;) {
            const item = listIterable_1_1.value;
            contents.push(item);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (listIterable_1_1 && !listIterable_1_1.done && (_a = listIterable_1.return)) await _a.call(listIterable_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return contents;
}
function getScoreAndMakeAssignments(names, addresses) {
    // Create reward and cost matrices. The reward matrix is generated from
    // using the suitability score algorithm provided. The cost matrix is
    // derived from the reward matrix by subtracting all scores in the reward
    // matrix from the same arbitrarily large number. 
    const n = names.length;
    const namesToAddressesMap = initMatrix(n, {}); // Initialize with dummy values
    const { rewards, costs } = createRewardAndCostMatrices(names, addresses, namesToAddressesMap);
    // Use cost matrix to obtain the optimized driver/destination
    // pairings in the form of an array of all matrix positions (i.e. [i,j])
    // that correspond to optimized pairings. Again, these optimized cost
    // pairings correspond to the optimized reward pairings in the original
    // reward matrix, so the assignments will work for maximization problem
    const assignmentIndices = munkres(costs);
    const totalScore = calculateTotalSuitabilityScore(rewards, assignmentIndices);
    const assignments = getNamesAndAddresses(assignmentIndices, namesToAddressesMap);
    return { totalScore, assignments };
}
function createRewardAndCostMatrices(names, addresses, namesToAddressesMap) {
    // Initialize the n x n reward matrix with zeros
    const n = addresses.length;
    const rewardMatrix = initMatrix(n, new Number(0));
    // Construct reward matrix, as well as fill mapping of all pairs of driver
    // names to destination addresses. This will be used to make the assignments
    names.forEach((name, row) => {
        addresses.forEach((address, column) => {
            rewardMatrix[row][column] = calculateSuitabilityScore(name, address);
            namesToAddressesMap[row][column] = { driver: name, destination: address };
        });
    });
    // Convert reward matrix to cost matrix
    const costMatrix = rewardMatrix.map((row) => {
        return row.map((score) => {
            // Use arbitrarily large value to subtract from
            return 1000 - score;
        });
    });
    return { rewards: rewardMatrix, costs: costMatrix };
}
function calculateTotalSuitabilityScore(scores, indices) {
    return indices.reduce((totalScore, current) => {
        return totalScore + scores[current[0]][current[1]];
    }, 0);
}
function initMatrix(size, initValue) {
    return new Array(size).fill(0).map((item) => {
        return new Array(size).fill(initValue);
    });
}
function calculateSuitabilityScore(name, address) {
    // Calculate the base suitability score based on the address length
    // and the number of vowels in the name
    let score = address.length % 2 == 0 ?
        getNumberOfVowels(name) * 1.5 : // Even address length
        getNumberOfConsonants(name); // Odd address length
    // Augment score if address length shares common factors with name length
    return hasLengthWithCommonFactors(name, address) ?
        score * 1.5 : // Increase by 50% above base SS
        score;
}
function getNamesAndAddresses(indices, mapping) {
    const namesAndAddresses = new Map();
    indices.forEach((current) => {
        const nameAndAddress = mapping[current[0]][current[1]];
        namesAndAddresses.set(nameAndAddress.driver, nameAndAddress.destination);
    });
    return namesAndAddresses;
}
function getNumberOfVowels(name) {
    const m = name.match(/[aeiou]/gi);
    return m === null ? 0 : m.length;
}
function getNumberOfConsonants(name) {
    const m = name.match(/[bcdfghjklmnpqrstvwxyz]/gi);
    return m === null ? 0 : m.length;
}
function hasLengthWithCommonFactors(name, address) {
    // Normalize the names and addresses by stripping any whitespace
    const strippedName = stripWhiteSpace(name);
    const strippedAddress = stripWhiteSpace(address);
    const addressLengthFactors = getFactorsBesides1(strippedAddress.length);
    const nameLengthFactors = getFactorsBesides1(strippedName.length);
    return addressLengthFactors.some(factor => nameLengthFactors.includes(factor));
}
function stripWhiteSpace(str) {
    return str.replace(/\s+/g, '');
}
function getFactorsBesides1(length) {
    return Array
        // Create sequence of numbers, ignoring 1, up to the given number
        // e.g. 7 -> [2,3,4,5,6,7]
        .from(Array(length), (_, i) => i + 2)
        // Filter for numbers in the sequence that the given number is divisible by
        .filter(i => length % i === 0);
}
function displayOutput(score, assignments) {
    console.log(`total score: ${score}`);
    console.log('assignments:');
    let content = `total score: ${score}\n`;
    content += 'assignments:' + '\n';
    assignments.forEach((destination, driver) => {
        console.log(`\tDriver: ${driver}`);
        console.log(`\tDestination: ${destination}\n`);
        content += '\tDriver:' + String(driver) + '\n';
        content += '\tDestination:' + String(destination) + '\n' + '\n';
    });
    const path = "./Data/Output";
    const filepath = "./Data/Output/Output.txt";
    fs.mkdir(path, { recursive: true }, (err) => {
        if (err) {
            console.log(err);
        }
    });
    fs.writeFile(filepath, content, err => {
        if (err) {
            console.error(err);
        }
        else {
            console.log("Output file created successfully! path: /Data/Output/Output.txt");
        }
    });
}
