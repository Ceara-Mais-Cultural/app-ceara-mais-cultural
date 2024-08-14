import { ScrollView, StyleSheet, View, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { colors, images } from '@/constants';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomText from '@/components/CustomText';
import { setAuthToken } from '../services/api';
import Loader from '@/components/Loader';

const SignIn = () => {
  const [form, setForm] = useState({
    email: '',
    senha: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null as any);
  
  const submit = () => {
    setIsLoading(true);
    setStatus(null);
    const body = {
      email: form.email,
      password: form.senha,
    };
    AuthService.login(body)
      .then(async (res) => {
        const response = res.data;
        setStatus('success');
        const jsonValue = JSON.stringify(response.user);
        await AsyncStorage.setItem('userData', jsonValue);
        await AsyncStorage.setItem('authToken', response.token);
        setAuthToken(response.token);
        setTimeout(() => {
          router.push('/stages');
        }, 2000);
      })
      .catch(() => {
        setStatus('error');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Loader visible={isLoading} successMessage='Bem-vindo(a)!' errorMessage='Erro ao entrar' status={status} />
      <ScrollView style={styles.background} contentContainerStyle={{ height: '100%' }}>
        <View style={styles.logoArea}>
          <Image style={styles.logo} source={images.logoDark} resizeMode='contain' />
        </View>

        <View style={styles.card}>
          <CustomText style={styles.doLoginText}>Faça seu login</CustomText>

          <FormField title='E-mail' value={form.email} inputMode='email' handleChangeText={(e: any) => setForm({ ...form, email: e })} />
          <FormField title='Senha' value={form.senha} inputMode='text' handleChangeText={(e: any) => setForm({ ...form, senha: e })} />

          <View style={styles.buttonArea}>
            <CustomButton title='Entrar' type='Primary' handlePress={submit} isLoading={isLoading} disabled={form.email == '' || form.senha == '' || isLoading} />
            <CustomButton title='Criar uma conta' type='Link' handlePress={() => router.push('/sign-up')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background_dark,
  },

  logoArea: {
    backgroundColor: colors.background_light,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 70,
    marginHorizontal: 75,
    borderRadius: 15,
  },

  logo: {
    width: 200,
    height: 200,
  },

  card: {
    backgroundColor: colors.off_white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    position: 'absolute',
    bottom: 0,
    flex: 1,
  },

  doLoginText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  buttonArea: {
    marginTop: 25,
    marginBottom: 15,
    marginHorizontal: 'auto',
    rowGap: 35,
  },
});
