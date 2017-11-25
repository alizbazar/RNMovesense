/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

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

export default class App extends Component {
  testBridge () {
    // console.log('DIR', Object.keys(RNMovesense))
    RNMovesense.addEvent('hey', 'there')
  }

  unsubscribers = []
  init = () => {
    this.unsubscribers.push(RNMovesenseEmitter.addListener('GYRO', data => {
      console.log(JSON.stringify(data))
      // console.log('GYRO', data)
    }))
    this.unsubscribers.push(RNMovesenseEmitter.addListener('INFO', data => {
      console.log('INFO', data)
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
