import { Text } from 'react-native';
import React from 'react';
import { colors } from '@/constants';

const CustomText = ({ style, ...props }: any) => {
  return <Text {...props} style={[{ fontFamily: 'Poppins', color: colors.text }, style]} />;
};

export default CustomText;
