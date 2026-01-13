#!/usr/bin/env node

const { Command } = require('commander')
const program = new Command()

program
    .name('reports')
    .description('Manager for mbes32 files')
    .version('1.0.0')
    .command('analyze', 'Analyze a file against a config.')
    .command('find', 'Search for files.')
    .command('find-many', 'Search for multiple files.')
    .command('start', 'Start application server.')
    .command('merge', 'Merge multiple files into one.')
    .command('update', 'Update events database.')

program.parse(process.argv)
