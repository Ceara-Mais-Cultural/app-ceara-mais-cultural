import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
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
    nome: '',
    cpfCnpj: '',
    municipio: 0,
    bairro: 0,
    comunidade: '',

    email: '',
    senha: '',
    confirmaSenha: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null as any);

  const [municipios, setMunicipios] = useState<any>([]);
  const [bairros, setBairros] = useState<any>([]);
  const [cpfCnpjError, setCpfCnpjError] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      getMunicipios();
    }, [])
  );

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

  const handleCpfCnpjChange = (input: string) => {
    const cleanedInput = input.replace(/\D/g, '');
    if (cleanedInput.length <= 11) {
      const formattedCpf = cleanedInput.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      setForm({ ...form, cpfCnpj: formattedCpf });
      if (AuthService.validateCpf(formattedCpf)) setCpfCnpjError(false);
      else setCpfCnpjError(true);
    } else {
      const formattedCnpj = cleanedInput.slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      setForm({ ...form, cpfCnpj: formattedCnpj });
      if (AuthService.validateCnpj(formattedCnpj)) setCpfCnpjError(false);
      else setCpfCnpjError(true);
    }
  };

  const selectMunicipio = (idMunicipio: number) => {
    if (!idMunicipio) return;
    setForm({ ...form, municipio: idMunicipio });
    getMunicipioBairros(idMunicipio);
  };

  const submit = () => {
    setIsLoading(true);
    setStatus(null);
    const body = {
      cpf: form.cpfCnpj,
      full_name: form.nome,
      email: form.email,
      city: form.municipio,
      neighborhood: form.bairro,
      community: form.comunidade ? form.comunidade : null,
      password: form.senha && form.confirmaSenha && form.senha === form.confirmaSenha ? form.senha : null,
    };
    AuthService.signUp(body)
      .then((res) => {
        setStatus(['success', 'Conta criada com sucesso!']);
        setTimeout(() => {
          router.replace('/sign-in');
        }, 2000);
      })
      .catch((error) => {
        setStatus(['error', 'Erro ao criar conta']);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Loader visible={isLoading} message={status[1]} status={status[0]} />
      <ScrollView style={styles.background}>
        <View style={styles.card}>
          <CustomText style={styles.title}>Crie sua conta</CustomText>
          {(step === 1 && (
            <>
              <CustomText style={styles.doLoginText}>Nos fale um pouco sobre você</CustomText>

              <FormField title='Primeiro e último nome' required='true' value={form.nome} handleChangeText={(e: any) => setForm({ ...form, nome: e })} />
              <FormField title='CPF/CNPJ' keyboardType='numeric' required='true' value={form.cpfCnpj} handleChangeText={(e: any) => handleCpfCnpjChange(e)} />
              <FormSelectField
                title='Município'
                required='true'
                selected={form.municipio}
                array={municipios}
                label='name'
                value='id'
                placeholder='Selecione'
                handleSelectChange={(idMunicipio: number) => {
                  selectMunicipio(idMunicipio);
                }}
              />
              <FormSelectField title='Bairro' disabled={bairros.length == 0} required='true' selected={form.bairro} array={bairros} label='name' value='id' placeholder='Selecione' handleSelectChange={(e: any) => setForm({ ...form, bairro: e })} />
              <FormField title='Comunidade' value={form.comunidade} handleChangeText={(e: any) => setForm({ ...form, comunidade: e })} />

              <View style={styles.buttonArea}>
                <CustomButton title='Continuar' disabled={!form.nome || !form.cpfCnpj || !form.municipio || !form.bairro || cpfCnpjError} type='Primary' handlePress={() => setStep(step + 1)} />
                <CustomButton title='Já tenho uma conta' type='Link' handlePress={() => router.push('/sign-in')} />
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
                  <CustomButton title='Criar conta' disabled={!form.email || !form.senha || !form.confirmaSenha || form.senha !== form.confirmaSenha} type='Primary' handlePress={() => submit()} />
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
