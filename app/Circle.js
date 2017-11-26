import React from 'react';
import { Circle as SvgCircle } from 'react-native-svg';

const speeds = {
  slow: 0.7,
  fast: 1.1
};

const padding = 20;

export default class Circle extends React.Component {
  constructor(props) {
    super();
    this.state = {
      r: props.r
    };
    this.increaseRadius = this.increaseRadius.bind(this);
  }

  increaseRadius() {
    const { speed } = this.props;
    const { r } = this.state;
    this.setState({ r: r + speeds[speed] });
  }

  componentDidMount() {
    const { animate, delay } = this.props;
    if (animate) {
      setTimeout(() => {
        this.interval = setInterval(this.increaseRadius, 1);
      }, delay);
    }
  }

  componentDidUpdate() {
    const { r: originalR, width } = this.props;
    const { r } = this.state;
    if (r > width) {
      clearInterval(this.interval);
      this.setState({ r: originalR }, () => {
        this.interval = setInterval(this.increaseRadius, 1);
      });
    }
  }

  render() {
    const { animate, height, width } = this.props;
    const { r } = this.state;
    const opacity = animate ? (width - r*2 - padding) / width : 1;
    return (
      <SvgCircle
        cx={width / 2}
        cy={height / 2}
        r={r}
        opacity={opacity}
        fill="#fff"
      />
    );
  }
}
