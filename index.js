#!/usr/bin/env node
#
# Command line client to read sensor values from Arduino

"use strict"

const RobotSerialInterface = require('robot-serial-iface').RobotSerialInterface
const winston = require('winston')

winston.log('debug', 'Starting the robot serial interface')
let robot = new RobotSerialInterface()
