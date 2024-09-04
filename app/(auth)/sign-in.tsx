import { ScrollView, StyleSheet, View, Image, Linking } from 'react-native';
import React, { useCallback, useState } from 'react';
import { colors, images } from '@/constants';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomText from '@/components/CustomText';
import { setAuthToken } from '../services/api';
import Loader from '@/components/Loader';

const SignIn = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<Array<any>>([]);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  useFocusEffect(
    useCallback(() => {
      validateEmail(email);
      if (password) {
        setErrors({ ...errors, password: '' });
      }
    }, [email, password])
  );

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email) || !email) {
      setErrors({ ...errors, email: '' });
      return true;
    } else {
      setErrors({ ...errors, email: 'Formato de email inválido' });
      return false;
    }
  };

  const validatePassword = (password: string) => {
    if (password.length > 0) {
      setErrors({ ...errors, password: '' });
      return true;
    } else {
      setErrors({ ...errors, password: 'A senha é obrigatória' });
      return false;
    }
  };

  const validateForm = () => {
    return validatePassword(password) && validateEmail(email);
  };

  const submit = () => {
    if (!validateForm()) return;

    setLoading(true);
    setLoadingMessage([]);
    const body = {
      email,
      password,
    };
    AuthService.login(body)
      .then(async (res) => {
        const response = res.data;
        setLoadingMessage(['success', 'Bem vindo(a)!']);
        const jsonValue = JSON.stringify(response.user);
        await AsyncStorage.setItem('userData', jsonValue);
        await AsyncStorage.setItem('authToken', response.token);
        setAuthToken(response.token);
        setTimeout(() => {
          router.push('/ideas');
        }, 2000);
      })
      .catch((error) => {
        if (error?.response?.status == 404) setLoadingMessage(['error', 'Email ou senha incorretos. Por favor, tente novamente']);
        else setLoadingMessage(['error', 'Ocorreu um erro no servidor. Tente novamente mais tarde']);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Loader visible={loading} status={loadingMessage[0]} message={loadingMessage[1]} />
      <ScrollView style={styles.background} contentContainerStyle={{ height: '100%' }} keyboardShouldPersistTaps='handled'>
        <View style={styles.logoArea}>
          <Image style={styles.logo} source={images.logoDark} resizeMode='contain' />
        </View>

        <View style={styles.card}>
          <CustomText style={styles.doLoginText}>Faça seu login</CustomText>

          <FormField title='E-mail' value={email} inputMode='email' handleChangeText={(newValue: any) => setEmail(newValue)} errorMessage={errors.email} />
          <FormField title='Senha' value={password} inputMode='text' handleChangeText={(newValue: any) => setPassword(newValue)} errorMessage={errors.password} />

          <View style={styles.buttonArea}>
            <CustomButton title='Esqueci a senha' type='Link' handlePress={() => Linking.openURL('https://ceara-mais-cultural-api.up.railway.app/confirmar-identidade/')} />
            <CustomButton title='Entrar' type='Primary' handlePress={submit} disabled={loading} />
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
