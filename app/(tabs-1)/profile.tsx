import { ScrollView, View, StyleSheet } from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '@/components/FormField';
import { colors } from '@/constants';
import CustomText from '@/components/CustomText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/authService';
import { useFocusEffect, router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { Linking } from 'react-native';

const Profile = () => {
  const [user, setUser] = useState({
    full_name: '-',
    cpf: '-',
    email: '-',
    city_name: '-',
    neighborhood_name: '-',
    community: '-',
    role: '-',
  });

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('userData').then((userData: any) => {
        const user = JSON.parse(userData)
        user.role = AuthService.getPermissionLevel(user);
        user.cpf = formatHiddenCpfCnpj(user?.cpf);
        setUser(user);
      });
    }, [])
  )

  const formatHiddenCpfCnpj = (cpfCnpj: string) => {
    const visibleDigits = 6; // Number of digits to show (first 4 and last 2)
    const maskedChars = cpfCnpj.length - visibleDigits;
    const maskedString = '*'.repeat(maskedChars);
    const visibleStart = cpfCnpj.slice(0, 4);
    const visibleEnd = cpfCnpj.slice(-2);

    return `${visibleStart}${maskedString}${visibleEnd}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 80 }}>
      <ScrollView style={styles.background}>
        <View style={styles.card}>
          <CustomText style={styles.title}>Minha Conta</CustomText>

          <FormField title='Nome' disabled='true' value={user?.full_name} />
          <FormField title='CPF/CNPJ' disabled='true' value={user?.cpf} />
          <FormField title='E-mail' disabled='true' value={user?.email} />
          <FormField title='Município' disabled='true' value={user?.city_name} />
          <FormField title='Bairro' disabled='true' value={user?.neighborhood_name} />
          <FormField title='Comunidade' disabled='true' value={user?.community || '-'} />
          <FormField title='Papel' disabled='true' value={user?.role} />

          <View style={styles.buttonArea}>
            <CustomButton title='Sair' type='Secondary' handlePress={() => router.replace('/sign-in')} />
            <CustomButton title='Excluir conta' type='Danger' handlePress={() => Linking.openURL('https://ceara-mais-cultural-api.up.railway.app/excluir-conta/')} />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background_dark,
  },

  card: {
    backgroundColor: colors.off_white,
    borderRadius: 25,
    padding: 25,
    margin: 15,
  },

  title: {
    fontFamily: 'PoppinsBold',
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 30,
  },

  buttonArea: {
    marginTop: 30,
    display: 'flex',
    gap: 15,
    marginHorizontal: 'auto',
  }
});
