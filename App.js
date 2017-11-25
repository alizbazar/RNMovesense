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

const RNMovesense = NativeModules.RNMovesense

const RNMovesenseEmitter = new NativeEventEmitter(RNMovesense)

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});


function sum(numbers) {
  return _.reduce(numbers, (a, b) => a + b, 0);
}

function average(numbers) {
  return sum(numbers) / (numbers.length || 1);
}

function makeWindow(before) {
  return function (_number, index, array) {
    const start = Math.max(0, index - before);
    const end   = Math.min(array.length, index + 1);
    return _.slice(array, start, end);
  }
}

function movingAverage(numbers) {
  const winSize = 10;
  const values = _.chain(numbers)
    .map('ArrayGyro[0].x')
    .map(makeWindow(winSize))
    .map(average)
    .filter((value, i) => i !== 0 && i % winSize === 0)
    .map(value => value > THRESHOLD || value < -THRESHOLD)
    .value();
  return values;
}

const MAX_HISTORY_LEN = 50
const THRESHOLD = 1
export default class App extends Component {
  constructor (props) {
    super (props)
    this.state = {
      nbrOfTruthy: 0,
    }
  }
  testBridge () {
    // console.log('DIR', Object.keys(RNMovesense))
    RNMovesense.addEvent('hey', 'there')
  }

  history = []
  unsubscribers = []
  init = () => {
    this.unsubscribers.push(RNMovesenseEmitter.addListener('GYRO', data => {
      this.history.push(data)
      if (this.history.length > MAX_HISTORY_LEN) {
        this.history.splice(0, 1)
      }
      const nbrOfTruthy = _.compact(movingAverage(this.history)).length
      this.setState({
        nbrOfTruthy,
      })
      console.log(nbrOfTruthy)
    }))
    
    this.unsubscribers.push(RNMovesenseEmitter.addListener('INFO', data => {
      console.log('INFO', data)
      if (data.type === 'DEVICE_CONNECTED') {
        RNMovesense.startListening()
      }
    }))
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
    const {
      nbrOfTruthy,
    } = this.state
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
