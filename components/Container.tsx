import { View } from 'react-native';
import React from 'react';

const Container = ({ style, ...props }: any) => {
  return <View {...props} style={[{ padding: 15, paddingBottom: 80 }, style]} />;
};

export default Container;
