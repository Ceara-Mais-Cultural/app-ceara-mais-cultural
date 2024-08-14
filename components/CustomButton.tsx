import { StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import React from 'react';
import { colors } from '@/constants';
import CustomText from './CustomText';

const CustomButton = ({ title, handlePress, isLoading, type, disabled, height=50, width=250 }: any) => {
  return (
    <Pressable onPress={handlePress} disabled={disabled} style={[disabled ? styles.disabled : styles.commonBackground, { height, width }, type === 'Primary' ? styles.backgroundPrimary : type === 'Secondary' ? styles.backgroundSecondary : type === 'Link' ? styles.backgroundLink : styles.backgroundDanger]}>
      {(isLoading && <ActivityIndicator />) || (!isLoading && <CustomText style={[styles.commonTitle, type === 'Primary' ? styles.titlePrimary : type === 'Secondary' ? styles.titleSecondary : type === 'Link' ? styles.titleLink : styles.titleDanger]}>{title}</CustomText>)}
    </Pressable>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  commonBackground: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },

  commonTitle: {
    width: '100%',
    textAlign: 'center',
  },

  disabled: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    opacity: 0.4
  },

  backgroundPrimary: {
    backgroundColor: colors.primary,
  },

  titlePrimary: {
    color: colors.white,
  },

  backgroundSecondary: {
    backgroundColor: colors.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  titleSecondary: {
    color: colors.primary,
    width: '100%',
  },

  backgroundLink: {
    padding: 10,
    width: 200,
    marginHorizontal: 'auto',
  },

  titleLink: {
    color: colors.primary,
    textDecorationLine: 'underline'
  },

  backgroundDanger: {
    backgroundColor: colors.danger,
  },

  titleDanger: {
    color: colors.white,
  },
});
