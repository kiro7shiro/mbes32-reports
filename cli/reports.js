#!/usr/bin/env node

const { Command } = require('commander')
const program = new Command()

program
    .name('reports')
    .description('Manager for mbes files')
    .version('0.1.0')
    .command('list', 'List mbes files of a given year.')
    .command('extract', 'Extract date from a list of mbes files.')

    .command('analyze', 'Analyze a file against a config.')
    .command('find', 'Search for files.')
    .command('find-many', 'Search for multiple files.')
    .command('start', 'Start application server.')
    .command('merge', 'Merge multiple files into one.')
    .command('update', 'Update events database.')

program.parse(process.argv)
