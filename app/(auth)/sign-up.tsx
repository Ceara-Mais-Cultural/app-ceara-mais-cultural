import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, MUNICIPIOS } from '@/constants';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormSelectField from '@/components/FormSelectField';
import GetDataService from 'app/services/getDataService';
import AuthService from '../services/authService';
import CustomText from '@/components/CustomText';

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nome: '',
    cpfCnpj: '',
    municipio: '',
    bairro: '',
    comunidade: '',

    email: '',
    senha: '',
    confirmaSenha: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [municipios, setMunicipios] = useState<any>(MUNICIPIOS);
  const [bairros, setBairros] = useState<any>([]);

  useEffect(() => {
    getMunicipios();
  }, []);

  const getMunicipios = () => {
    GetDataService.getCities().then((res) => {
      setMunicipios(res.data);
    });
  };

  const getMunicipioBairros = (idMunicipio: any) => {
    GetDataService.getNeighborhoods(idMunicipio).then((res) => {
      setBairros(res.data);
    });
  };

  const submit = () => {
    setIsLoading(true);
    const body = {
      cpf: form.cpfCnpj,
      full_name: form.nome,
      email: form.email,
      city: form.municipio,
      neighborhood: form.bairro,
      is_staff: false,
      is_superuser: false,
    };
    AuthService.signUp(body)
      .then((res) => {
        // Modal com o nome do cara?
        router.replace('/sign-in');
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const errors = error.response.data;
          let errorMessage = '';
          for (const key in errors) {
            if (errors[key]) {
              errorMessage += `${key}: ${errors[key].join(', ')}\n`;
            }
          }
          Alert.alert('Erro ao criar conta', errorMessage);
        } else {
          Alert.alert('Erro', 'Ocorreu um erro ao criar a conta.');
        }
        console.error('Erro ao criar conta.', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.background}>
        <View style={styles.card}>
          <CustomText style={styles.title}>Crie sua conta</CustomText>
          {(step === 1 && (
            <>
              <CustomText style={styles.doLoginText}>Nos fale um pouco sobre você</CustomText>

              <FormField title='Nome' required='true' value={form.nome} handleChangeText={(e: any) => setForm({ ...form, nome: e })} />
              <FormField title='CPF/CNPJ' required='true' value={form.cpfCnpj} handleChangeText={(e: any) => setForm({ ...form, cpfCnpj: e })} />

              <FormSelectField
                title='Município'
                required='true'
                selected={form.municipio}
                array={municipios}
                label='name'
                value='id'
                placeholder='Selecione'
                handleSelectChange={(e: any) => {
                  setForm({ ...form, municipio: e });
                  getMunicipioBairros(e);
                }}
              />
              <FormSelectField title='Bairro' required='true' selected={form.bairro} array={bairros} label='name' value='id' placeholder='Selecione' handleSelectChange={(e: any) => setForm({ ...form, bairro: e })} />

              <FormField title='Comunidade' value={form.comunidade} handleChangeText={(e: any) => setForm({ ...form, comunidade: e })} />

              <View style={styles.buttonArea}>
                <CustomButton title='Continuar' type='Primary' handlePress={() => setStep(step + 1)} />
                <CustomButton title='Já tenho um conta' type='Link' handlePress={() => router.push('/sign-in')} />
              </View>
            </>
          )) ||
            (step == 2 && (
              <>
                <CustomText style={styles.doLoginText}>Informações de Login</CustomText>

                <FormField title='E-mail' value={form.email} keyboardType='email-address' handleChangeText={(e: any) => setForm({ ...form, email: e })} />
                <FormField title='Senha' value={form.senha} keyboardType='password' handleChangeText={(e: any) => setForm({ ...form, senha: e })} />
                <FormField title='Confirme a senha' value={form.confirmaSenha} keyboardType='password' handleChangeText={(e: any) => setForm({ ...form, confirmaSenha: e })} />

                <View style={styles.buttonArea}>
                  <CustomButton title='Criar conta' type='Primary' handlePress={() => submit()} isLoading={isLoading} />
                  <CustomButton title='Já tenho um conta' type='Link' handlePress={() => router.push('/sign-in')} />
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
