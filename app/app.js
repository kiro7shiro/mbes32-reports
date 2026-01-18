#!/usr/bin/env node
const path = require('path')
const express = require('express')

const app = express()
const templates = require('templates')({ views: path.resolve(__dirname, 'views') })
app.use(express.json())
app.use(templates)
app.locals.settings = {
    eventsFile: path.resolve(__dirname, '../data/events.xlsx'),
    eventsConfig: path.resolve(__dirname, '../data/eventsConfig.json'),
    eventsBlacklist: [
        function (data) {
            return Object.keys(data).length === 0
        },
        function (data) {
            return data.matchcode === undefined
        },
        function (data) {
            return data.kind === 'Wartung'
        },
        function (data) {
            const duration = data.end - data.start
            const days = Math.floor(duration / (1000 * 60 * 60 * 24))
            return days >= 364
        }
    ],
    eventsDataPath: path.resolve(__dirname, '../test/data')
}
app.use('/src', express.static(path.resolve(__dirname, 'src')))
app.use('/data', require('../api/data.js'))
app.use(express.static(path.resolve(__dirname, 'public')))
app.use(express.static(path.resolve(__dirname, '../node_modules/frappe-gantt/dist')))

module.exports = app
