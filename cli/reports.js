#!/usr/bin/env node

const { Command } = require('commander')
const program = new Command()

program
    .name('reports')
    .description('Manager for mbes32 files')
    .version('1.0.0')
    .command('find', 'Search for files.')
    .command('find-many', 'Search for multiple files.')
    .command('start', 'Start application server.')

program.parse(process.argv)
