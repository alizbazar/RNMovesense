import React from 'react';
import { G, LinearGradient, Stop, Defs, Rect } from 'react-native-svg';

export default class App extends React.Component {
  render() {
    const { height, rayHeight, rayWidth, width } = this.props;
    return (
      <G>
        <Defs>
          <LinearGradient id="sea" x1="0%" x2="0%" y1="0%" y2="100%">
            <Stop offset="0" stopColor="#ACB6E5" stopOpacity="1" />
            <Stop offset="1" stopColor="#74ebd5" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="ray" x1="0%" x2="0%" y1="0%" y2="100%">
            <Stop offset="0%" stopColor="#fff" stopOpacity="0.06" />
            <Stop offset={rayHeight} stopColor="#fff" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect
          fill="url(#sea)"
          x="0"
          y={height / 2}
          height={height / 2}
          width={width}
        />
        <Rect
          fill="url(#ray)"
          x={(width - rayWidth) / 2}
          y={height / 2}
          height={height / 2}
          width={rayWidth}
        />
      </G>
    );
  }
}
