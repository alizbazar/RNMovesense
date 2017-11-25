import React from 'react';
import { G, LinearGradient, Stop, Defs, Rect } from 'react-native-svg';

export default class App extends React.Component {
  render() {
    const { height, width } = this.props;
    return (
      <G>
        <Defs>
          <LinearGradient id="sky" x1="0%" x2="0%" y1="0%" y2="100%">
            <Stop offset="0" stopColor="#faaca8" stopOpacity="1" />
            <Stop offset="1" stopColor="#ddd6f3" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect
          fill="url(#sky)"
          x="0"
          y="0"
          height={height / 2}
          width={width}
        />
      </G>
    );
  }
}
