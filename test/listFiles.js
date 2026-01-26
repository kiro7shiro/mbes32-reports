const path = require('path')
const { findFiles } = require('../src/reports.js')

async function test() {
    try {
        const fruit = 'C:\\Users\\tiedemann\\Messe Berlin GmbH\\Event Services - Veranstaltungsproduktion\\FRUIT'
        const { directory, files } = await findFiles(fruit, "'FRUIT 26", { filesQuery: "'009_Reinigung" })
        console.table(files, ['filename', 'score'])
    } catch (error) {
        console.error(error)
    }

}

test()