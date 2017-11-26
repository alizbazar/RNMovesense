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
    zIndex: 99
  },
  text: {
    backgroundColor: 'transparent',
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
  constructor() {
    super();
    this.state = {
      text: null
    };
    this.changeText = _.debounce(this.changeText.bind(this), fadeDuration);
  }

  componentWillReceiveProps(nextProps) {
    const { text } = this.state;
    if (nextProps.text !== text) {
      this.changeText(nextProps.text);
    }
  }

  changeText(text) {
    const { text: originalText } = this.state;
    if (originalText) {
      this.refs.text.fadeOut(fadeDuration);
    }
    setTimeout(() => {
      this.setState({ text }, () => {
        const duration = originalText ? fadeDuration : 4 * fadeDuration;
        this.refs.text.fadeIn(duration);
      });
    }, originalText ? fadeDuration : 0);
  }

  render() {
    const { text } = this.state;
    return (
      <Animatable.View ref="text" style={styles.view}>
        <Text style={styles.text}>{text}</Text>
      </Animatable.View>
    );
  }
}
