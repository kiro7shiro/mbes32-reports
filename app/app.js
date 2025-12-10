#!/usr/bin/env node
const path = require('path')
const express = require('express')

const app = express()
app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.locals.settings = {
    eventsFile: path.join(__dirname, '../data/events.xlsx'),
    eventsConfig: path.join(__dirname, '../data/eventsConfig.json'),
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
    ]
}
app.use('/src', express.static(path.join(__dirname, 'src')))
app.use('/data', require('../api/data.js'))
app.use('/controls', require('../api/controls.js'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, '../node_modules/frappe-gantt/dist')))

module.exports = app
