import { Image, Pressable, StyleSheet, TextInput, View, Text } from 'react-native';
import React, { useState } from 'react';
import { colors, icons } from '@/constants';
import CustomText from './CustomText';

const FormField = ({ title, placeholder, value, inputMode = 'text', width = '100%', height, required, icon, handleChangeText, disabled, multiline = false, numberOfLines = 4, errorMessage, ...props }: any) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const isPasswordField = title.toLowerCase().includes('senha');

  return (
    <View style={[styles.formField, { width, height }]}>
      {title && <CustomText style={styles.title}>{`${title} ${required ? '*' : ''}`}</CustomText>}
      <View style={[styles.inputArea, multiline && styles.textAreaContainer, errorMessage && styles.errorBorder, disabled && styles.disabled]}>
        <TextInput
          {...props}
          secureTextEntry={isPasswordField && !showPassword}
          style={[styles.input, multiline ? styles.textArea : isPasswordField ? { width: '90%' } : { width: '100%' }]}
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          editable={!disabled}
          onChangeText={handleChangeText}
          autoCapitalize={isPasswordField || title?.toLowerCase().includes('mail') ? 'none' : 'sentences'}
          multiline={multiline}
          rows={multiline ? numberOfLines : 1}
          verticalAlign={multiline ? 'top' : 'center'}
        />
        {isPasswordField && (
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Image tintColor={colors.menu_secundary} style={styles.eyeIcon} source={!showPassword ? icons.eye : icons.eyeHide} resizeMode='contain' />
          </Pressable>
        )}
      </View>
      {errorMessage && <CustomText style={styles.errorMessage}>{errorMessage}</CustomText>}
    </View>
  );
};

export default FormField;

const styles = StyleSheet.create({
  formField: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  textAreaContainer: {
    height: 'auto', // Permite que a altura do textarea seja automática
    paddingVertical: 10, // Adiciona padding vertical para textarea
  },

  input: {
    fontSize: 17,
    paddingHorizontal: 15,
    color: colors.text,
    width: '100%',
    height: '100%',
  },

  textArea: {
    height: 100,
    paddingVertical: 5,
    textAlignVertical: 'top',
  },

  eyeIcon: {
    position: 'relative',
    right: 15,
    height: 30,
    width: 30,
  },

  errorBorder: {
    borderColor: 'red',
  },

  errorMessage: {
    color: 'red',
    marginTop: 5,
  },

  disabled: {
    backgroundColor: '#DDD'
  }
});
