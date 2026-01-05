const path = require('path')
const { Command, Option } = require('commander')
const { parse, serialize } = require('xlsx-fuzzyparser')

const program = new Command()
program.description('Merge multiple files into one.')

program.argument('<files...>', 'list of files to merge')

program.option('-c, --config <config>', 'The configuration to read from files.')
program.option('-r, --report <report>', 'The configuration to read from files.')

program.parse()

const files = program.args
const options = program.opts()

const testFiles = [
	'../data/GW 26/GW26_BECC_KAL_WISAG_Reinigung_JI_20251201.xlsx',
	'../data/GW 26/GW26_PLA_NL_Reinigung_Masterlayout_RT_20261201.xlsx',
	'../data/GW 26/IGW26_CCB-H17_KALK_SASSE_REINIGUNG_RW_20251121.xlsx'
]
const config = path.resolve(__dirname, '../data/es-to-cds-wcplanung-config.js')
const report = path.resolve(__dirname, '../data/es-to-cds-wcplanung-report.js')

async function main() {
	console.log('[mergeFiles]')
	const filesData = {}
	for (let fCnt = 0; fCnt < testFiles.length; fCnt++) {
		const file = path.resolve(process.cwd(), testFiles[fCnt])
        console.log('parsing file:')
		console.log(file)
		const fileData = await parse(file, config)
		filesData[file] = fileData
	}
    console.log(filesData)
	await serialize(filesData, '../data/report.xlsx', { config: report })
}

main()
