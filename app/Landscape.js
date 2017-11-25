import React from 'react';
import Svg, { G } from 'react-native-svg';
import Dimensions from 'Dimensions';
import Circle from './Circle';
import Sea from './Sea';
import Sky from './Sky';

const { height, width } = Dimensions.get('window');
const r = 60;

export default class Landscape extends React.Component {
  render() {
    const { animate, speed, rayHeight } = this.props;
    return (
      <Svg height={height} width={width}>
        <Sky height={height} width={width} />
        <Circle animate={false} delay={0} height={height} r={r} speed={speed} width={width} />
        {animate && (
          <G>
            <Circle animate={true} delay={0} height={height} r={r} speed={speed} width={width} />
            <Circle animate={true} delay={800} height={height} r={r} speed={speed} width={width} />
            <Circle animate={true} delay={1600} height={height} r={r} speed={speed} width={width} />
            <Circle animate={true} delay={2400} height={height} r={r} speed={speed} width={width} />
          </G>
        )}
        <Sea height={height} rayHeight={rayHeight} rayWidth={r * 2} width={width} />
      </Svg>
    );
  }
}
