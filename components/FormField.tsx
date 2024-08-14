import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import { colors, icons } from '@/constants';
import CustomText from './CustomText';

const FormField = ({ title, placeholder, value, inputMode, width = '100%', required, icon, handleChangeText, disabled }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View style={[styles.formField, { width }]}>
      {title && <CustomText style={styles.title}>{`${title} ${required ? '*' : ''}`}</CustomText>}
      <View style={styles.inputArea}>
        <TextInput style={[styles.input, title.toLowerCase().includes('senha') ? { width: '90%' } : { width: '100%' }]} inputMode={inputMode} value={value} placeholder={placeholder} placeholderTextColor={colors.placeholder} readOnly={disabled} onChangeText={handleChangeText} autoCapitalize={title?.toLowerCase().includes('senha') || title?.toLowerCase().includes('mail') ? 'none' : 'sentences'} secureTextEntry={title?.toLowerCase().includes('senha') && !showPassword} />
        {title.toLowerCase().includes('senha') && (
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Image tintColor={colors.menu_secundary} style={styles.eyeIcon} source={!showPassword ? icons.eye : icons.eyeHide} resizeMode='contain' />
          </Pressable>
        )}
      </View>
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  input: {
    fontSize: 17,
    paddingHorizontal: 15,
    color: colors.text,
    width: '100%',
    height: '100%',
  },

  eyeIcon: {
    position: 'relative',
    right: 15,
    height: 30,
    width: 30,
  },
});
