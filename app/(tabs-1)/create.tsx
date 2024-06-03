import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '@/components/FormField';
import { colors } from '@/constants';
import { router } from 'expo-router';
import FormSelectField from '@/components/FormSelectField';
import CustomButton from '@/components/CustomButton';
import * as DocumentPicker from 'expo-document-picker';
import AuthService from '../services/authService';
import GetDataService from '../services/getDataService';
import PostDataService from '../services/postDataService';
import CustomText from '@/components/CustomText';

const Create = () => {
  const initialFormState = {
    titulo: '',
    descricao: '',
    categoria: '',
    mobilizadorAgente: '',
    municipio: '',
    bairro: '',
    comunidade: '',
    local: '',
    imagens: [] as DocumentPicker.DocumentPickerAsset[],
  };

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState<any>(initialFormState);
  const [categorias, setCategorias] = useState([]);
  const [agentesCulturais, setAgentesCulturais] = useState([]);
  const [mobilizadores, setMobilizadores] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AuthService.getUserData().then((userData: any) => {
        const user = JSON.parse(userData);
        setUser(user);
        const role = AuthService.getPermissionLevel(user);
        if (role === 'Agente Cultural') {
          setIsAdmin(false);
          getPromoters();
        } else {
          setIsAdmin(true);
          getAgents();
        }
      });
      setForm(initialFormState);
      getMunicipios();
      getCategories();
    }, [])
  );

  const getAgents = () => {
    GetDataService.getAgents().then((res) => {
      setAgentesCulturais(res.data);
    });
  };

  const getPromoters = () => {
    GetDataService.getPromoters().then((res) => {
      setMobilizadores(res.data);
    });
  };

  const getCategories = () => {
    GetDataService.getCategories().then((res) => {
      setCategorias(res.data);
    });
  };

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

  const uploadFileHandler = async () => {
    try {
      const pickedFile = await DocumentPicker.getDocumentAsync();
      const file = pickedFile.assets;
      if (!file) return;
      setForm({ ...form, imagens: file });
    } catch (err) {
      console.error(err);
    }
  };

  const validateForm = () => {
    const formValid = !!form.titulo && !!form.descricao && !!form.categoria && !!form.municipio && !!form.bairro && !!form.local;
    return formValid;
  };

  const submit = () => {
    setIsLoading(true);
    const body = {
      title: form.titulo,
      description: form.descricao,
      city: user.city,
      neighborhood: user.neighborhood,
      community: form.community,
      location: form.local,
      category: form.categoria,
      author: isAdmin ? Number(form.mobilizadorAgente) || null : user.id,
      promoter: isAdmin ? user.id : Number(form.mobilizadorAgente) || null,
      status: 'waiting',
    };
    PostDataService.createIdea(body)
      .then((res) => {
        setIsLoading(false);
        router.replace('pre-register');
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
          Alert.alert('Erro ao cadastrar ideia', errorMessage);
        } else {
          Alert.alert('Erro', 'Ocorreu um erro ao cadastrar ideia.');
        }
        console.error('Erro ao cadastrar ideia.', error);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.title}>Ideia de Projeto</CustomText>
      </View>
      <ScrollView>
        <View style={styles.card}>
          <FormField title='Título' required='true' value={form.titulo} handleChangeText={(e: any) => setForm({ ...form, titulo: e })} />
          <FormField title={isAdmin ? 'Descreva a ideia do agente cultural' : 'Conte um pouco sobre a sua ideia'} size='bg' required='true' value={form.descricao} handleChangeText={(e: any) => setForm({ ...form, descricao: e })} />
          <FormSelectField title='Categoria' required='true' selected={form.categoria} array={categorias} label='name' value='id' placeholder='Selecione' handleSelectChange={(e: any) => setForm({ ...form, categoria: e })} />
          <FormSelectField title={isAdmin ? 'Agente Cultural' : 'Mobilizador(a)'} selected={form.mobilizadorAgente} array={isAdmin ? agentesCulturais : mobilizadores} label='full_name' value='id' placeholder='Nenhum(a)' handleSelectChange={(e: any) => setForm({ ...form, mobilizadorAgente: e })} />
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
          <FormField title='Local' size='md' required='true' value={form.local} handleChangeText={(e: any) => setForm({ ...form, local: e })} />

          {form.imagens.length ? (
            <View style={styles.buttonArea}>
              <CustomButton title='Escolher outra imagem' width={150} type='Secondary' handlePress={async () => uploadFileHandler()} />
              <Image source={{ uri: form.imagens[0]?.uri }} style={styles.image} />
            </View>
          ) : (
            <View style={styles.buttonArea}>
              <CustomButton title='Escolha uma imagem' width={150} type='Secondary' handlePress={async () => uploadFileHandler()} />
            </View>
          )}

          <View style={styles.buttonArea}>
            <CustomButton title='Continuar' type='Primary' disabled={!validateForm()} handlePress={submit} isLoading={isLoading} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background_light,
    flex: 1,
    paddingBottom: 80,
  },

  header: {
    backgroundColor: colors.background_dark,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    gap: 10,
  },

  title: {
    color: colors.white,
    fontFamily: 'PoppinsBold',
    fontSize: 26,
    textAlign: 'center',
  },

  card: {
    backgroundColor: colors.off_white,
    marginHorizontal: 15,
    padding: 25,
    borderRadius: 25,
    marginVertical: 15,
  },

  image: {
    marginHorizontal: 'auto',
    width: 200,
    height: 200,
    margin: 20,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: colors.background_dark,
  },

  buttonArea: {
    marginTop: 15,
    marginHorizontal: 'auto',
  },
});
