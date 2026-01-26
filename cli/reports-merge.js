const path = require('path')
const { Command, Option, Argument } = require('commander')
const { parse, serialize } = require('xlsx-fuzzyparser')

const program = new Command()
program.description('Merge multiple files into one.')

class Defaults {
    static configParser = function (value) {
        const filePath = path.resolve(process.cwd(), value)
        return require(filePath)
    }
    static listConfig = {
        type: 'list',
        sheetName: 'report',
        row: 1,
        columns: [
            { index: 1, key: 'filepath' },
            { index: 2, key: 'filename' },
            { index: 3, key: 'lastModified' }
        ]
    }
    static beforeMerge = function (data) {
        const [startDate, endDate] = data.reduce(
            function ([sDate, eDate], obj) {
                if (!Object.hasOwn(obj, 'dates') || obj.dates.length < 1) return [sDate, eDate]
                const { dates } = obj
                if (dates[0] < sDate || sDate === 0) sDate = dates[0]
                if (dates[dates.length - 1] > eDate) eDate = dates[dates.length - 1]
                return [sDate, eDate]
            },
            [0, 0]
        )
        console.log(startDate, endDate)
        const days = 1000 * 60 * 60 * 24
        return data.reduce(function (result, obj) {
            if (!Object.hasOwn(obj, 'dates') || obj.dates.length < 1) return result
            const startDiff = (obj.dates[0] - startDate) / days
            console.log({ date: obj.dates[0], startDiff })
            const patStart = new Array(startDiff).fill('')
            const patGaps = []
            for (let dCnt = 0; dCnt < obj.dates.length - 1; dCnt++) {
                const curr = obj.dates[dCnt]
                const next = obj.dates[dCnt + 1]
                const diff = Math.round((next - curr) / days) - 1
                if (diff > 0) {
                    const pat = new Array(diff).fill('')
                    patGaps.push(curr, ...pat)
                } else {
                    patGaps.push(curr)
                }
            }
            const timeline = [...patStart, ...patGaps]
            const newObj = { ...obj }
            newObj.dates = timeline
            result.push(newObj)
            return result
        }, [])
    }
}

program.addArgument(
    new Argument('<filesList>', 'A filename of an excel file containing a list of files to merge').argParser(function (value) {
        return path.resolve(process.cwd(), value)
    })
)

program.addArgument(
    new Argument('<report>', 'A filename to write the merged data to.').argParser(function (value) {
        return path.resolve(process.cwd(), value)
    })
)

program.addOption(
    new Option('-lc --list-config <listConfig>', 'The configuration for reading a files list from an excel file.')
        .argParser(Defaults.configParser)
        .default(Defaults.listConfig)
)
program.addOption(
    new Option('-ic --input-config <inputConfig>', 'The configuration for parsing the input files.')
        .argParser(Defaults.configParser)
        .default(Defaults.listConfig)
)
program.addOption(
    new Option('-oc --output-config <outputConfig>', 'The configuration for writing the parsed data into a new file.')
        .argParser(Defaults.configParser)
        .default(Defaults.listConfig)
)

program.parse()
const filesList = program.processedArgs[0]
const report = program.processedArgs[1]
const options = program.opts()

async function main() {
    console.log('[mergeFiles]')
    /* console.log(filesList)
    console.log(options) */

    // parse the input list file
    const files = await parse(filesList, options.listConfig)
    console.table(files, ['filename'])
    // parse the input files data
    let filesData = []
    console.log('parsing files...')
    for (let fCnt = 0; fCnt < files.length; fCnt++) {
        // TODO : update to a dynamic version for reading the properties from the data
        const { filepath, filename } = files[fCnt]
        const file = path.resolve(process.cwd(), filepath, filename)
        const fileData = await parse(file, options.inputConfig)
        filesData.push(...fileData)
    }
    filesData = Defaults.beforeMerge(filesData)
    console.log(`parsed ${filesData.length} data object(s)...`)
    //console.table([...filesData.slice(0, 3), ...filesData.slice(-3)])
    //console.table(filesData)

    // merge files data
    await serialize(filesData, report, { config: options.outputConfig })
    console.log(`saved as: ${report}`)
}

main()
