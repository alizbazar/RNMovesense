/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import _ from 'lodash'
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

import KalmanFilter from 'kalmanjs'
import UIContainer from './app/App'

const RNMovesense = NativeModules.RNMovesense

const RNMovesenseEmitter = new NativeEventEmitter(RNMovesense)


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});


const alphaSmooth = (() => {
  const ALPHA = 0.005
  let estimate = -0.7
  return {
    get() {
      return estimate
    },
    update(val) {
      const err = val - estimate
      estimate += ALPHA*err
      return this.get()
    },
    normalize(val) {
      return val - estimate
    }
  }
})()

function averageOf(arr) {
  return arr.reduce((sum, current) => sum + current, 0) / arr.length
}

const detectChange = (() => {
  const MAX_LEN = 5
  const THRESHOLD = 5
  const TRAIL_LENGTH = 4 // half breaths in & out, should be multiple of 2
  const history = []
  const trail = []
  let state = {
    direction: 'in',
    startedAt: Date.now(),
  }
  let listener
  let changeItem
  return {
    setListener(callback) {
      listener = callback
    },
    get() {
      return state
    },
    update(val) {
      const now = Date.now()
      history.push({value: val, timestamp: now})
      if (history.length < MAX_LEN) {
        if (history.length === (MAX_LEN - 1)) {
          // INITIALIZE
          const avg = history.reduce((sum, current) => sum + current, 0) / history.length
          const direction = avg > 0 ? 'out' : 'in'
          const startedAt = history[0].timestamp
          state = {
            direction,
            startedAt,
          }
        }
        return
      }
      if (history.length > MAX_LEN) {
        history.splice(0, 1)
      }
      
      return this.detectChange()
    },
    detectChange() {
      const sign = state.direction === 'in' ? 1 : -1
      const min = sign * Math[sign > 0 ? 'min' : 'max'](history[0].value, history[1].value)
      const max = sign * Math[sign > 0 ? 'max' : 'min'](history[1].value, history[2].value)
      let didChange = true
      if (min > 0) {
        didChange = false
      } else if (max < 0) {
        didChange = false
      } else if ((max - min) < THRESHOLD) {
        didChange = false
      } else if ((sign * averageOf([history[2].value, history[3].value, history[4].value])) < 0) {
        didChange = false
      } else if (history.indexOf(changeItem) > 0) {
        didChange = false
      }
      if (didChange) {
        state = {
          direction: (state.direction === 'in' ? 'out' : 'in'),
          startedAt: Date.now(),
        }
        changeItem = history[MAX_LEN - 1]
        trail.push(state)
        if (trail.length > TRAIL_LENGTH) {
          trail.splice(0, 1)
        }
        let breathLength = null
        if (trail.length === TRAIL_LENGTH) {
          breathLength = (trail[TRAIL_LENGTH - 1].startedAt - trail[0].startedAt) / TRAIL_LENGTH * 2
        }
        state.breathLength = breathLength
        console.log('                 ', state)
        if (listener) {
          listener(state)
        }
      }
      return didChange
    }
  }
})()

const kalmanFilter = new KalmanFilter({R: 0.05, Q: -0.7})
function processData (data) {
  const {
    Timestamp,
    ArrayGyro,
  } = data
  // console.log(Timestamp, ArrayGyro)
  const { x, y, z } = ArrayGyro[0]
  alphaSmooth.update(x)
  const val = kalmanFilter.filter(x)
  const normalized = alphaSmooth.normalize(val)
  detectChange.update(normalized)
  printVal(x, normalized, normalized)
}

function padToLength (x, length) {
  let prev = x.toString().substring(0, length - 1)
  if (prev.length < (length - 1)) {
    prev = new Array(length - prev.length).join(' ') + prev
  }
  return prev
}

function printVal (orig, x, xToVisualize) {
  let originalValue = padToLength(orig, 7)
  let prev = padToLength(x, 7)
  // const next = xToVisualize.toString().substring(0, 6)
  const SCALE = 12
  const MAX = 20
  const rounded = parseInt(Math.max(Math.min(xToVisualize * SCALE, MAX), -MAX), 10)
  const next = new Array(Math.abs(rounded)).join(rounded > 0 ? '#' : 'o')
  let toPrint = new Array(MAX).join(' ')
  if (rounded < 0) {
    toPrint = toPrint.substring(0, MAX + rounded)
  }
  toPrint += next
  console.log(`${originalValue} -> ${prev}: ${toPrint}`)
}

const STATE_TRAIL_LENGTH = 4
export default class App extends Component {
  constructor (props) {
    super (props)
    this.state = {
      nbrOfTruthy: 0,
      stateTrail: [],
    }
  }
  testBridge () {
    // console.log('DIR', Object.keys(RNMovesense))
    RNMovesense.addEvent('hey', 'there')
  }

  componentDidMount () {
    this.init()
  }

  unsubscribers = []
  init = () => {
    detectChange.setListener(changedState => {
      const stateTrail = this.state.stateTrail.slice()
      stateTrail.push(changedState)
      if (stateTrail.length > STATE_TRAIL_LENGTH) {
        stateTrail.splice(0, 1)
      }
      this.setState({
        stateTrail,
      })
    })

    this.unsubscribers.push(RNMovesenseEmitter.addListener('GYRO', data => {
      // processData(data)
      const x = data.ArrayGyro[0].x + 0.5
      printVal(0, x, x)
    }))
    
    // this.unsubscribers.push(RNMovesenseEmitter.addListener('ACCELOROMETER', data => {
    //   console.log('ACC', data)
    // }))
    
    // this.unsubscribers.push(RNMovesenseEmitter.addListener('HRVRR', data => {
    //   console.log('RR', data)
    // }))
    
    RNMovesenseEmitter.addListener('INFO', data => {
      console.log('INFO', data)
      if (data.type === 'CONNECTED') {
        RNMovesense.startListening()
      } else if (data.type === 'DISCONNECTED') {
        
      }
    })
    RNMovesense.initialize()
  }

  startScan () {
    RNMovesense.startScan()
  }

  startListening () {
    RNMovesense.startListening()
  }

  stopListening() {
    RNMovesense.stopListening()
  }

  render() {
    // const {
    //   stateTrail,
    // } = this.state
    // return (
    //   <UIContainer
    //     stateTrail={this.state.stateTrail}
    //   />
    // )

    return (
      <View style={styles.container}>
        <TouchableHighlight onPress={this.testBridge}>
          <Text style={styles.welcome}>
            Test Bridge
          </Text>
        </TouchableHighlight>


        <TouchableHighlight onPress={this.init}>
          <Text style={styles.welcome}>
            Init
          </Text>
        </TouchableHighlight>

        <TouchableHighlight onPress={this.startScan}>
          <Text style={styles.welcome}>
            Start scan
          </Text>
        </TouchableHighlight>

        <TouchableHighlight onPress={this.startListening}>
          <Text style={styles.welcome}>
            Start listening
          </Text>
        </TouchableHighlight>

        <TouchableHighlight onPress={this.startListening}>
          <Text style={styles.welcome}>
            Stop listening
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
