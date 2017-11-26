import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import Landscape from './Landscape';
import SlowText from './SlowText';

const fontSize = 30;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ecf0f1'
  },
  introText: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontFamily: 'AvenirNext-Medium',
    fontSize: 40,
    position: 'absolute',
    textAlign: 'center',
    top: '10%',
    width: '100%'
  },
  logoText: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontFamily: 'AvenirNext-Bold',
    fontSize: 52,
    position: 'absolute',
    textAlign: 'center',
    top: '25%',
    width: '100%'
  },
  start: {
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderRadius: 180,
    borderWidth: 3,
    left: '10%',
    padding: 10,
    position: 'absolute',
    right: '10%',
    top: '68%',
    width: '80%',
    zIndex: 99
  },
  startText: {
    color: '#fff',
    fontFamily: 'AvenirNext-Medium',
    fontSize,
    textAlign: 'center'
  }
});

function getText(isInit, speed) {
  if (!isInit) {
    return 'Try breathing\nfaster';
  } else {
    if (speed === 'fast') {
      return 'You are breathing fast';
    } else {
      return 'You are breathing slow';
    }
  }
}

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      step: 'home',
      text: null
    };
    this.start = this.start.bind(this);
  }

  start() {
    this.setState({
      step: 'start'
    });
    setTimeout(() => {
      this.setState({ isInit: true });
    }, 5000);
  }

  render() {
    const { speed } = this.props;
    const { step, isInit } = this.state;
    const text = step !== 'home' ? getText(isInit, speed) : null;
    const animate = step !== 'home';
    const rayHeight = step === 'home' ? '0%' : '60%';
    return (
      <View style={styles.container}>
        <Landscape animate={animate} rayHeight={rayHeight} speed={speed} />
        {step === 'home' && <Text style={styles.introText}>Welcome{"\n"}to</Text>}
        {step === 'home' && <Text style={styles.logoText}>ānpā</Text>}
        <SlowText text={text} />
        {step === 'home' && (
          <TouchableOpacity onPress={this.start} style={styles.start}>
            <Text style={styles.startText}>Let's begin!</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}
