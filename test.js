const path = require('path')
const { readFile } = require('./src/files.js')

async function main(params) {
    const list = path.resolve(process.cwd(), './cli/queries.xlsx')
    console.log(list)
    const content = await readFile(list)
    console.log(content)
}

main()