#!/usr/bin/env node

// Command line client to read sensor values from Arduino

"use strict"

const rrd = require('rrdtools')
const fs = require('fs')
const RobotSerialInterface = require('robot-serial-iface').RobotSerialInterface
const winston = require('winston')
const yaml = require('js-yaml')

const CONFIG_PATH = '/etc/hydroctl/config.yml'

winston.level = process.env.LOG_LEVEL || 'info'

winston.log('info', 'Starting the robot serial interface')
let robot = new RobotSerialInterface()

let rrdDataFile = null;

robot.on('batch', (values) => {
  winston.log('debug', 'All the sensor values: %j', values)
  updateRRDFile(
    rrdDataFile,
    values.temperature1,
    values.temperature2,
    values.humidity1,
    values.humidity2,
    values.light)
  .catch((err) => {
    winston.log('error', 'Error saving data: %s', err)
  })
})

// Force the thing to emit in batch events.
robot.emitBatch()

function loadConfiguration() {
  return new Promise((resolve, reject) => {
    try {
      let doc = yaml.safeLoad(fs.readFileSync(CONFIG_PATH, 'utf8', { filename: CONFIG_PATH }))
      resolve(doc)
    } catch (e) {
      reject(e)
    }
  })
}

function now () {
  return Math.ceil((new Date).getTime() / 1000)
}

function updateRRDFile (fileName, t1, t2, h1, h2, light) {
  return new Promise((resolve, reject) => {
    rrd.update(
      fileName,
      'inside-temp:outside-temp:inside-humidity:outside-humidity:inside-light',
      [ [ now(), t1, t2, h1, h2, light ].join(':')], (err) => {
        if (err) return reject(err)
        resolve()
      })
  })
}

function createRRDFile (fileName, step) {
  return new Promise((resolve, reject) => {
    try {
      winston.log('info', 'Trying to create the RRD file: %s', fileName)
      rrd.create(
        fileName,
        step,
        now(),
        [
         'DS:inside-temp:GAUGE:8460:-35:120',
         'DS:outside-temp:GAUGE:8460:-35:120',
         'DS:inside-humidity:GAUGE:8460:0:100',
         'DS:outside-humidity:GAUGE:8460:0:100',
         'DS:inside-light:GAUGE:8460:0:1000',
         'RRA:AVERAGE:0.5:1:2880',
         'RRA:AVERAGE:0.5:5:2880',
         'RRA:AVERAGE:0.5:30:4320',
         'RRA:AVERAGE:0.5:360:5840',
         'RRA:MAX:0.5:1:2880',
         'RRA:MAX:0.5:5:2880',
         'RRA:MAX:0.5:30:4320',
         'RRA:MAX:0.5:360:5840',
         'RRA:MIN:0.5:1:2880',
         'RRA:MIN:0.5:5:2880',
         'RRA:MIN:0.5:30:4320',
         'RRA:MIN:0.5:360:5840'
       ], 
       (err) => {
         if (err) {
           winston.log('error', err)
           return reject(err)
         }
         winston.log('info', 'Created RRD file')
         resolve()
       })
    } catch (e) {
      reject(e)
    }
  })
}

function ensureRRDFileExists(fileName, step) {
  return new Promise((resolve, reject) => {
    fs.stat(fileName, (err, stat) => {
      if (err) {
        winston.log('error', 'Error stat\'ing file: %j', err)
        if (err.code === 'ENOENT') {
          winston.log('info', 'Fixing to create the RRD file: %s', fileName)
          createRRDFile(fileName, step)
            .then(resolve)
            .catch(reject)
        } else {
          reject(err)
        }
      } else {
        resolve()
      }
    })
  })
}

loadConfiguration()
  .then((config) => {
    rrdDataFile = config.rrdfile
    ensureRRDFileExists(config.rrdfile, config.step)
      .then(() => {
        // Get the robot started 
        robot.start(
          config.serial_port,
          {
            baudrate: config.baudrate
          },
          [
            {
              name: 'light',
              startByte: 0x01,
              numBytes: 2
            },
            {
              name: 'humidity1',
              startByte: 0x02,
              numBytes: 2
            },
            {
              name: 'humidity2',
              startByte: 0x03,
              numBytes: 2
            },
            {
              name: 'temperature1',
              startByte: 0x04,
              numBytes: 2
            },
            {
              name: 'temperature2',
              startByte: 0x05,
              numBytes: 2
            }
          ]
        )
      })
  })
  .catch((err) => {
    winston.log('error', 'An error: %s', err)
  })
