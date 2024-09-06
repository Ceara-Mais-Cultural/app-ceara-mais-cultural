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
import GetDataService from '../services/getDataService';
import FormSelectField from '@/components/FormSelectField';
import Loader from '@/components/Loader';

const Profile = () => {
  const [form, setForm] = useState({
    id: '',
    name: '-',
    cpf: '-',
    formatedCpf: '',
    email: '-',
    city: '-',
    neighborhood: '-',
    community: '-',
    role: '-',
  });

  const [editing, setEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<Array<any>>([]);
  const [cities, setCities] = useState<any>([]);
  const [neighborhoods, setNeighborhoods] = useState<any>([]);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    city: '',
    neighborhood: '',
  });

  useFocusEffect(
    useCallback(() => {
      setEditing(false);
      resetUserData();
    }, [])
  );

  const resetUserData = () => {
    AsyncStorage.getItem('userData').then((user: any) => {
      const userData = JSON.parse(user);
      userData.role = AuthService.getPermissionLevel(userData);
      getCities();
      getCityNeighborhoods(userData.city);
      setForm({ ...userData, name: userData.full_name, formatedCpf: formatHiddenCpf(userData?.cpf) });
    });
  };

  const formatHiddenCpf = (cpf: string) => {
    const visibleDigits = 5;
    const maskedChars = cpf.length - visibleDigits;
    const maskedString = '*'.repeat(maskedChars);
    const visibleStart = cpf.slice(0, 3);
    const visibleEnd = cpf.slice(-2);

    return `${visibleStart}${maskedString}${visibleEnd}`;
  };

  const cancelEdit = () => {
    resetUserData();
    setEditing(!editing);
    setErrors({
      name: '',
      email: '',
      city: '',
      neighborhood: '',
    });
  };

  const validateForm = () => {
    return validateName(form.name) && validateEmail(form.email) && validateCity(form.city) && validateNeighborhood(form.neighborhood);
  };

  const saveChanges = () => {
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
    };
    AuthService.editUserData(body, form.id)
      .then(async (res) => {
        setLoadingMessage(['success', 'Dados alterados com sucesso!']);
        const jsonValue = JSON.stringify(res.data);
        await AsyncStorage.setItem('userData', jsonValue);
        setTimeout(() => {
          setLoading(false);
          setEditing(false);
        }, 2000);
      })
      .catch(() => {
        setLoadingMessage(['error', 'Erro ao salvar alterações. Tente novamente mais tarde']);
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      });
  };

  const handleFieldChange = (field: string, newValue: any) => {
    switch (field) {
      case 'name':
        validateName(newValue);
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

  const selectCity = (cityId: string) => {
    if (!cityId) {
      setForm({ ...form, neighborhood: '' });
      setNeighborhoods([]);
      return;
    }
    setForm({ ...form, city: cityId });
    getCityNeighborhoods(cityId);
  };

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

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 80 }}>
      <Loader visible={loading} status={loadingMessage[0]} message={loadingMessage[1]} />
      <ScrollView style={styles.background} keyboardShouldPersistTaps='handled'>
        <View style={styles.card}>
          <CustomText style={styles.title}>{!editing ? 'Minha Conta' : 'Editar Dados'}</CustomText>

          <FormField title='Primeiro e último nome' inputMode='text' required='true' value={form.name} handleChangeText={(newValue: any) => handleFieldChange('name', newValue)} errorMessage={errors.name} disabled={!editing} />
          <FormField title='CPF' inputMode='numeric' value={form.formatedCpf} handleChangeText={(newValue: any) => handleFieldChange('cpf', newValue)} disabled={true} />
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
            disabled={!editing}
          />
          <FormSelectField title='Bairro' disabled={neighborhoods.length == 0 || !editing} required='true' selected={form.neighborhood} array={neighborhoods} label='name' value='id' placeholder='Selecione' handleSelectChange={(newValue: any) => handleFieldChange('neighborhood', newValue)} errorMessage={errors.neighborhood} />
          <FormField title='Comunidade' value={form.community} disabled={!editing} handleChangeText={(newValue: any) => setForm({ ...form, community: newValue })} />
          <FormField title='Papel' disabled={true} value={form?.role} />

          {(!editing && (
            <View style={styles.buttonArea}>
              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <CustomButton title='Sair' type='Secondary' width='48%' handlePress={() => router.replace('/sign-in')} />
                <CustomButton title='Editar dados' type='Primary' width='48%' handlePress={() => setEditing(!editing)} />
              </View>
              <View style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                <CustomButton title='Excluir conta' type='Danger' width='60%' handlePress={() => Linking.openURL('https://ceara-mais-cultural-api.up.railway.app/excluir-conta/')} />
              </View>
            </View>
          )) || (
            <View style={styles.buttonArea}>
              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <CustomButton title='Cancelar' type='Secondary' width='48%' handlePress={() => cancelEdit()} />
                <CustomButton title='Salvar' type='Primary' width='48%' handlePress={() => saveChanges()} />
              </View>
            </View>
          )}
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
  },
});
