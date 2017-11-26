import React from 'react';
import { StyleSheet, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import _ from 'lodash';

const fontSize = 34;

const styles = StyleSheet.create({
  view: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: '62%',
    width: '100%',
    zIndex: 99,
    color: '#fff',
    fontFamily: 'AvenirNext-Medium',
    fontSize,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center'
  }
});

const fadeDuration = 300;

export default class SlowText extends React.Component {
  render() {
    const { text } = this.props;
    return (
      <Text style={styles.view}>{text}</Text>
    );
  }
}
