#!/usr/bin/env node

// Command line client to read sensor values from Arduino

"use strict"

const rrd = require('rrdtools')
const fs = require('fs')
const RobotSerialInterface = require('robot-serial-iface').RobotSerialInterface
const winston = require('winston')

const rrdDataFile = 'readings.rrd'
const STEP = 300

winston.level = process.env.LOG_LEVEL || 'info'

winston.log('debug', 'Starting the robot serial interface')
let robot = new RobotSerialInterface()

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

function createRRDFile (fileName) {
  return new Promise((resolve, reject) => {
    rrd.create(
      fileName,
      STEP,
      now(),
      [
       'DS:inside-temp:GAUGE:600:-35:120',
       'DS:outside-temp:GAUGE:600:-35:120',
       'DS:inside-humidity:GAUGE:600:0:100',
       'DS:outside-humidity:GAUGE:600:0:100',
       'DS:inside-light:GAUGE:600:0:1000',
       'RRA:MIN:0.5:12:1440',
       'RRA:MAX:0.5:12:1440',
       'RRA:AVERAGE:0.5:1:1440'
     ], 
     (err) => {
       if (err) return reject(err)
       resolve()
     })
  })
}

function ensureRRDFileExists(fileName) {
  return new Promise((resolve, reject) => {
    fs.stat(fileName, (err, stat) => {
      if (err) {
        winston.log('error', 'Error stat\'ing file: %j', err)
        if (err.code === 'ENOENT') {
          createRRDFile(fileName)
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

ensureRRDFileExists(rrdDataFile)
  .then(() => {
    // Get the robot started 
    robot.start(
      '/dev/ttyACM0',
      {
        baudrate: 9600
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
  }).
  catch((err) => {
    winston.log('error', 'An error: %s', err)
  });
