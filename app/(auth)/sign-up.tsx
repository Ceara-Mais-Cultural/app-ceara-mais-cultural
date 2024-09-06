import { ScrollView, StyleSheet, View, Text } from 'react-native';
import React, { useCallback, useState } from 'react';
import { colors } from '@/constants';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormSelectField from '@/components/FormSelectField';
import GetDataService from 'app/services/getDataService';
import AuthService from '../services/authService';
import CustomText from '@/components/CustomText';
import Loader from '@/components/Loader';

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    cpf: '',
    city: '',
    neighborhood: '',
    community: '',

    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<Array<any>>([]);
  const [errors, setErrors] = useState({
    name: '',
    cpf: '',
    city: '',
    neighborhood: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [cities, setCities] = useState<any>([]);
  const [neighborhoods, setNeighborhoods] = useState<any>([]);

  useFocusEffect(
    useCallback(() => {
      getCities();
    }, [])
  );

  const getCities = () => {
    setLoadingMessage([]);
    setLoading(true);
    GetDataService.getCities()
      .then((res) => {
        setCities(res.data);
      })
      .catch(() => {
        setLoadingMessage(['error', 'Erro ao recuperar municípios. Tente novamente mais tarde']);
        setTimeout(() => {
          router.replace('/sign-in');
        }, 2000);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getCityNeighborhoods = (cityId: any) => {
    setLoading(true);
    setLoadingMessage([]);
    GetDataService.getNeighborhoods(cityId)
      .then((res) => {
        setNeighborhoods(res.data);
      })
      .catch(() => {
        setLoadingMessage(['error', 'Erro ao recuperar bairros. Tente novamente mais tarde']);
        setTimeout(() => {
          router.replace('/sign-in');
        }, 2000);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFieldChange = (field: string, newValue: any) => {
    switch (field) {
      case 'name':
        validateName(newValue);
        break;
      case 'cpf':
        validateCpf(newValue);
        break;
      case 'city':
        validateCity(newValue);
        break;
      case 'neighborhood':
        validateNeighborhood(newValue);
        break;
      case 'email':
        validateEmail(newValue);
        break;
      case 'password':
        validatePasswords(newValue, 'password');
        break;
      case 'confirmPassword':
        validatePasswords(newValue, 'confirmPassword');
        break;

      default:
        break;
    }
  };

  const validateName = (firstLastName: string) => {
    setForm({ ...form, name: firstLastName });
    if (firstLastName.split(' ').length < 2 || firstLastName.split(' ')[1] === '') {
      setErrors({ ...errors, name: 'Deve conter pelo menos duas palavras' });
      return false;
    } else {
      setErrors({ ...errors, name: '' });
      return true;
    }
  };

  const validateCpf = (cpf: string) => {
    const cleanedInput = cpf.replace(/\D/g, '');
    let formatedValue = cpf;
    let valid = true;
    if (cleanedInput.length > 0 && cleanedInput.length != 11) {
      setErrors({ ...errors, cpf: 'CPF em formato inválido' });
      valid = false;
    } else if (cleanedInput.length == 11) {
      const formattedCpf = cleanedInput.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      formatedValue = formattedCpf;
      if (!AuthService.validateCpf(cleanedInput)) {
        setErrors({ ...errors, cpf: 'CPF inválido' });
        valid = false;
      } else {
        setErrors({ ...errors, cpf: '' });
        valid = true;
      }
      
      valid = true;
    } else {
      setErrors({ ...errors, cpf: 'Este campo é obrigatório' });
      valid = false;
    }
    setForm({ ...form, cpf: formatedValue });
    return valid;
  };

  const validateCity = (cityId: string) => {
    if (form.city !== cityId) selectCity(cityId);
    if (!cityId) {
      setErrors({ ...errors, city: 'Este campo é obrigatório' });
      setForm({ ...form, city: cityId });
      return false;
    } else {
      setErrors({ ...errors, city: '' });
      setForm({ ...form, city: cityId });
      return true;
    }
  };

  const validateNeighborhood = (neighborhoodId: string) => {
    if (!neighborhoodId) {
      setErrors({ ...errors, neighborhood: 'Este é um campo obrigatório' });
      setForm({ ...form, neighborhood: neighborhoodId });
      return false;
    } else {
      setErrors({ ...errors, neighborhood: '' });
      setForm({ ...form, neighborhood: neighborhoodId });
      return true;
    }
  };

  const validateEmail = (email: string) => {
    setForm({ ...form, email: email });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors({ ...errors, email: 'Este campo é obrigatório' });
    } else if (emailRegex.test(email) || !email) {
      setErrors({ ...errors, email: '' });
      return true;
    } else {
      setErrors({ ...errors, email: 'Formato de email inválido' });
      return false;
    }
  };

  const validatePasswords = (password: string, type: string) => {
    if (type == 'password') {
      setForm({ ...form, password: password });
      if (!form.password) {
        setErrors({ ...errors, password: 'Este campo é obrigatório' });
      } else if (password.length < 6) {
        setErrors({ ...errors, password: 'A senha deve ter pelo menos 6 caracteres' });
        return false;
      } else {
        setErrors({ ...errors, password: '' });
        return true;
      }
    } else {
      setForm({ ...form, confirmPassword: password });
      if (!!form.password && password != form.password) {
        setErrors({ ...errors, confirmPassword: 'As senhas não coincidem' });
        return false;
      } else {
        setErrors({ ...errors, confirmPassword: '' });
        return true;
      }
    }
  };

  const validateForm = () => {
    if (step == 1) {
      return validateName(form.name) && validateCpf(form.cpf) && validateCity(form.city) && validateNeighborhood(form.neighborhood);
    } else {
      return validateEmail(form.email) && validatePasswords(form.password, 'password') && validatePasswords(form.confirmPassword, 'confirmPassword');
    }
  };

  const nextStep = () => {
    if (validateForm()) setStep(step + 1);
  };

  const selectCity = (cityId: string) => {
    if (!cityId) {
      setForm({ ...form, neighborhood: '' });
      setNeighborhoods([]);
      return;
    }
    setForm({ ...form, city: cityId });
    getCityNeighborhoods(cityId);
  };

  const submit = () => {
    if (!validateForm()) return;
    setLoading(true);
    setLoadingMessage([]);
    const body = {
      cpf: form.cpf,
      full_name: form.name,
      email: form.email,
      city: form.city,
      neighborhood: form.neighborhood,
      community: form.community ? form.community : null,
      password: form.password && form.confirmPassword && form.password === form.confirmPassword ? form.password : null,
    };
    AuthService.signUp(body)
      .then(() => {
        setLoadingMessage(['success', 'Conta criada com sucesso!']);
        setTimeout(() => {
          setLoading(false);
          router.replace('/sign-in');
        }, 2000);
      })
      .catch(() => {
        setLoadingMessage(['error', 'Erro ao criar conta']);
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Loader visible={loading} status={loadingMessage[0]} message={loadingMessage[1]} />
      <ScrollView style={styles.background} keyboardShouldPersistTaps='handled'>
        <View style={styles.card}>
          <CustomText style={styles.title}>Crie sua conta</CustomText>
          {(step === 1 && (
            <>
              <CustomText style={styles.doLoginText}>Nos fale um pouco sobre você</CustomText>

              <FormField title='Primeiro e último nome' inputMode='text' required='true' value={form.name} handleChangeText={(newValue: any) => handleFieldChange('name', newValue)} errorMessage={errors.name} />
              <FormField title='CPF' inputMode='numeric' required='true' value={form.cpf} handleChangeText={(newValue: any) => handleFieldChange('cpf', newValue)} errorMessage={errors.cpf} />
              <FormSelectField
                title='Município'
                required='true'
                selected={form.city}
                array={cities}
                label='name'
                value='id'
                placeholder='Selecione'
                handleSelectChange={(newValue: any) => {
                  handleFieldChange('city', newValue);
                }}
                errorMessage={errors.city}
              />
              <FormSelectField title='Bairro' disabled={neighborhoods.length == 0} required='true' selected={form.neighborhood} array={neighborhoods} label='name' value='id' placeholder='Selecione' handleSelectChange={(newValue: any) => handleFieldChange('neighborhood', newValue)} errorMessage={errors.neighborhood} />
              <FormField title='Comunidade' value={form.community} handleChangeText={(newValue: any) => setForm({ ...form, community: newValue })} />

              <View style={styles.buttonArea}>
                <CustomButton title='Continuar' disabled={loading} type='Primary' handlePress={() => nextStep()} />
                <CustomButton title='Já tenho uma conta' type='Link' handlePress={() => router.push('/sign-in')} />
              </View>
            </>
          )) ||
            (step == 2 && (
              <>
                <CustomText style={styles.doLoginText}>Informações de Login</CustomText>
                <Text></Text>
                <FormField title='E-mail' value={form.email} inputMode='email' handleChangeText={(newValue: any) => handleFieldChange('email', newValue)} errorMessage={errors.email} />
                <FormField title='Senha' value={form.password} inputMode='text' handleChangeText={(newValue: any) => handleFieldChange('password', newValue)} errorMessage={errors.password} />
                <FormField title='Confirme a senha' value={form.confirmPassword} inputMode='text' handleChangeText={(newValue: any) => handleFieldChange('confirmPassword', newValue)} errorMessage={errors.confirmPassword} />

                <View style={styles.buttonArea}>
                  <CustomButton title='Criar conta' disabled={loading} type='Primary' handlePress={() => submit()} />
                  <CustomButton title='Voltar' disabled={loading} type='Secondary' handlePress={() => setStep(step - 1)} />
                  <CustomButton title='Já tenho uma conta' type='Link' handlePress={() => router.push('/sign-in')} />
                </View>
              </>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

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
    color: colors.text,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 40,
  },

  doLoginText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
  },

  buttonArea: {
    marginVertical: 25,
    marginHorizontal: 'auto',
    rowGap: 35,
  },
});
