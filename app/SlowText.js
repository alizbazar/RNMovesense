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
    zIndex: 99,
    color: '#fff',
    fontFamily: 'AvenirNext-Medium',
    fontSize,
    textAlign: 'center',
    width: '100%'
  }
});

const fadeDuration = 500;

export default class SlowText extends React.Component {
  constructor() {
    super();
    this.state = {
      text: null
    };
    this.changeText = _.debounce(this.changeText.bind(this), fadeDuration, {
      leading: true,
      trailing: true
    });
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
        this.refs.text.fadeIn(fadeDuration);
      });
    }, originalText ? fadeDuration : 0);
  }

  render() {
    const { text } = this.props;
    return (
      <Animatable.View ref="text" style={styles.view}>
        <Text style={styles.view}>{text}</Text>
      </Animatable.View>
    );
  }
}
