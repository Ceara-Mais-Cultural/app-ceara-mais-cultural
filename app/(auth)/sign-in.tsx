import { ScrollView, StyleSheet, View, Image, Linking } from 'react-native';
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
  const [status, setStatus] = useState([] as any);

  const submit = () => {
    setIsLoading(true);
    setStatus([]);
    const body = {
      email: form.email,
      password: form.senha,
    };
    AuthService.login(body)
      .then(async (res) => {
        const response = res.data;
        setStatus(['success', 'Bem vindo(a)!']);
        const jsonValue = JSON.stringify(response.user);
        await AsyncStorage.setItem('userData', jsonValue);
        await AsyncStorage.setItem('authToken', response.token);
        setAuthToken(response.token);
        setTimeout(() => {
          router.push('/stages');
        }, 2000);
      })
      .catch((error) => {
        if (error?.response?.status == 404) setStatus(['error', 'Email ou senha incorretos. Por favor, tente novamente']);
        else setStatus(['error', 'Ocorreu um erro no servidor. Tente novamente mais tarde']);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Loader visible={isLoading} message={status[1]} status={status[0]} />
      <ScrollView style={styles.background} contentContainerStyle={{ height: '100%' }}>
        <View style={styles.logoArea}>
          <Image style={styles.logo} source={images.logoDark} resizeMode='contain' />
        </View>

        <View style={styles.card}>
          <CustomText style={styles.doLoginText}>Faça seu login</CustomText>

          <FormField title='E-mail' value={form.email} inputMode='email' handleChangeText={(e: any) => setForm({ ...form, email: e })} />
          <FormField title='Senha' value={form.senha} inputMode='text' handleChangeText={(e: any) => setForm({ ...form, senha: e })} />

          <View style={styles.buttonArea}>
            <CustomButton title='Esqueci a senha' type='Link' handlePress={() => Linking.openURL('https://ceara-mais-cultural-api.up.railway.app/confirmar-identidade/')}  />
            <CustomButton title='Entrar' type='Primary' handlePress={submit}  disabled={form.email == '' || form.senha == '' || isLoading} />
            <CustomButton title='Criar uma conta' type='Secondary' handlePress={() => router.push('/sign-up')} />
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
    marginBottom: 15,
    marginHorizontal: 'auto',
    rowGap: 25,
  },

  forgot: {
    backgroundColor: '#FFF',
  },
});
