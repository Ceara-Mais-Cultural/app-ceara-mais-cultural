import { StyleSheet, View } from 'react-native';
import React from 'react';
import { colors } from '@/constants';
import { Picker } from '@react-native-picker/picker';
import CustomText from './CustomText';

const FormSelectField = ({ title, placeholder, selected, array, label, value, required, disabled, handleSelectChange, errorMessage }: any) => {
  return (
    <View style={styles.formSelectField}>
      <CustomText style={styles.title}>{`${title} ${required ? '*' : ''}`}</CustomText>
      <View style={[styles.inputArea, errorMessage && styles.errorBorder]}>
        <Picker style={styles.picker} enabled={!disabled} selectedValue={selected} onValueChange={handleSelectChange}>
          <Picker.Item style={styles.placeholder} label={placeholder} value={null} />
          {array && array.map((option: any, index: number) => (
            <Picker.Item key={index} label={option[label]} value={option[value]} />
          ))}
        </Picker>
      </View>
      {errorMessage && <CustomText style={styles.errorMessage}>{errorMessage}</CustomText>}
    </View>
  );
};

export default FormSelectField;

const styles = StyleSheet.create({
  formSelectField: {
    marginVertical: 5,
  },

  title: {
    fontFamily: 'PoppinsBold',
    color: colors.text,
  },

  inputArea: {
    height: 45,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderColor: colors.stroke,
    borderWidth: 1,
  },

  picker: {
    position: 'relative',
    bottom: 5.5,
  },

  placeholder: {
    color: colors.placeholder,
  },

  errorBorder: {
    borderColor: 'red',
  },

  errorMessage: {
    color: 'red',
    marginTop: 5,
  },
});
