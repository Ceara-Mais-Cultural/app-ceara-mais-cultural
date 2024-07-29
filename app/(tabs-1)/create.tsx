import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '@/components/FormField';
import { colors } from '@/constants';
import { router } from 'expo-router';
import FormSelectField from '@/components/FormSelectField';
import CustomButton from '@/components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import AuthService from '../services/authService';
import GetDataService from '../services/getDataService';
import PostDataService from '../services/postDataService';
import CustomText from '@/components/CustomText';
import { readFile } from 'react-native-fs';

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
    image: '',
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
        setForm({ ...form, municipio: user.city, bairro: user.neighborhood });
        setUser(user);
        getMunicipioBairros(user.city);
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

  const selectMunicipio = (idMunicipio: number) => {
    if (!idMunicipio) return;
    setForm({ ...form, municipio: idMunicipio });
    getMunicipioBairros(idMunicipio);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
    if (result.assets) {
      console.log(result?.assets[0]);
      setForm({ ...form, image: result.assets[0] });
    }
  };

  const validateForm = () => {
    const formValid = !!form.titulo && !!form.descricao && !!form.categoria && !!form.municipio && !!form.bairro && !!form.local;
    return formValid;
  };

  // Função para converter o URI em um blob
  const uriToBlob = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error converting URI to blob:', error);
      throw error;
    }
  };

  // Função para enviar a imagem
  const submit = async () => {
    const uri = form.image.uri;
    const blob = await uriToBlob(uri);
    const formData = new FormData();

    formData.append('image', blob, 'photo.jpg');
    formData.append('title', form.titulo);
    formData.append('description', form.descricao);
    formData.append('city', user.city);
    formData.append('neighborhood', user.neighborhood);
    formData.append('community', form.community);
    formData.append('location', form.local);
    formData.append('category', form.categoria);
    formData.append('author', isAdmin ? Number(form.mobilizadorAgente || null).toString() : user.id.toString());
    formData.append('promoter', isAdmin ? user.id.toString() : Number(form.mobilizadorAgente || null).toString());
    formData.append('status', 'waiting');

    PostDataService.createIdea(formData)
      .then((res) => {
        setIsLoading(false);
        router.replace('pre-register');
      })
      .catch((error) => {
        Alert.alert('Erro', 'Ocorreu um erro ao cadastrar ideia.' + JSON.stringify(error));
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
          <FormSelectField title={isAdmin ? 'Agente Cultural' : 'Mobilizador(a)'} required={isAdmin} selected={form.mobilizadorAgente} array={isAdmin ? agentesCulturais : mobilizadores} label='full_name' value='id' placeholder='Nenhum(a)' handleSelectChange={(e: any) => setForm({ ...form, mobilizadorAgente: e })} />
          <FormSelectField
            title='Município'
            required='true'
            selected={form.municipio}
            disabled={true}
            array={municipios}
            label='name'
            value='id'
            placeholder='Selecione'
            handleSelectChange={(idMunicipio: number) => {
              selectMunicipio(idMunicipio);
            }}
          />
          <FormSelectField title='Bairro' disabled={true} required='true' selected={form.bairro} array={bairros} label='name' value='id' placeholder='Selecione' handleSelectChange={(e: any) => setForm({ ...form, bairro: e })} />
          <FormField title='Comunidade' value={form.comunidade} handleChangeText={(e: any) => setForm({ ...form, comunidade: e })} />
          <FormField title='Local' size='md' required='true' value={form.local} handleChangeText={(e: any) => setForm({ ...form, local: e })} />

          {form.image ? (
            <View style={styles.buttonArea}>
              <CustomButton title='Escolher outra imagem' width={150} type='Secondary' handlePress={async () => pickImage()} />
              <Image source={{ uri: form.image?.uri }} style={styles.image} />
            </View>
          ) : (
            <View style={styles.buttonArea}>
              <CustomButton title='Escolha uma imagem' width={150} type='Secondary' handlePress={async () => pickImage()} />
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
