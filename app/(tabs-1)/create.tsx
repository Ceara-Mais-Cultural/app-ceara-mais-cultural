import { View, StyleSheet, ScrollView, Image } from 'react-native';
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
import CustomText from '@/components/CustomText';
import { api } from '../services/api';
import Loader from '@/components/Loader';

const Create = () => {
  const initialFormState = {
    title: '',
    description: '',
    category: '',
    promoterAgent: '',
    city: '',
    neighborhood: '',
    community: '',
    location: '',
    image: '',
  };

  const initialErrorState = {
    title: '',
    description: '',
    category: '',
    city: '',
    neighborhood: '',
  };

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState<any>(initialFormState);
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [promoters, setPromoters] = useState([]);
  const [cities, setCities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<Array<any>>([]);
  const [errors, setErrors] = useState(initialErrorState);
  const [authToken, setAuthToken] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      resetForm();
      getCities();
      getCategories();
      GetDataService.deleteAllFiles();

      AuthService.getUserData().then((userData: any) => {
        const user = JSON.parse(userData);
        setAuthToken(userData.token);
        setUser(user);
        getCityNeighborhoods(user?.city);
        setForm({ ...form, city: user?.city, neighborhood: user?.neighborhood, community: user?.community });
        const role = AuthService.getPermissionLevel(user);
        if (role === 'Agente Cultural') {
          setIsAdmin(false);
          getPromoters();
        } else {
          setIsAdmin(true);
          getAgents();
        }
      });
    }, [])
  );

  const resetForm = () => {
    setForm(initialFormState);
    setErrors(initialErrorState);
  };

  const getAgents = () => {
    setLoadingMessage([]);
    setLoading(true);
    GetDataService.getAgents()
      .then((res) => {
        setAgents(res.data);
      })
      .catch(() => {
        setLoadingMessage(['error', 'Erro ao recuperar agentes. Tente novamente mais tarde']);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getPromoters = () => {
    setLoadingMessage([]);
    setLoading(true);
    GetDataService.getPromoters()
      .then((res) => {
        setPromoters(res.data);
      })
      .catch(() => {
        setLoadingMessage(['error', 'Erro ao recuperar mobilizadores. Tente novamente mais tarde']);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getCategories = () => {
    setLoadingMessage([]);
    setLoading(true);
    GetDataService.getCategories()
      .then((res) => {
        setCategories(res.data);
      })
      .catch(() => {
        setLoadingMessage(['error', 'Erro ao recuperar categorias. Tente novamente mais tarde']);
      })
      .finally(() => {
        setLoading(false);
      });
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
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getCityNeighborhoods = (cityId: any) => {
    setForm({ ...form, neighborhood: '' });
    setNeighborhoods([]);
    if (!cityId) return;
    setLoadingMessage([]);
    setLoading(true);
    GetDataService.getNeighborhoods(cityId)
      .then((res) => {
        setNeighborhoods(res.data);
      })
      .catch(() => {
        setLoadingMessage(['error', 'Erro ao recuperar bairros. Tente novamente mais tarde']);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
    if (result.assets) {
      setForm({ ...form, image: result.assets[0] });
    }
  };

  const validateForm = () => {
    const formValid = validateTitle(form?.title) && validateDescription(form?.description) && validateCategory(form?.category) && validateCity(form?.city) && validateNeighborhood(form?.neighborhood);
    return formValid;
  };

  const submit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setLoadingMessage([]);
    const formData = new FormData();
    if (form?.image) {
      formData.append('image', {
        uri: form?.image.uri,
        type: form?.image.mimeType,
        name: form?.image.fileName,
      } as any);
    }
    formData.append('title', form?.title);
    formData.append('description', form?.description);
    formData.append('city', user?.city);
    formData.append('neighborhood', user?.neighborhood);
    if (form?.community) {
      formData.append('community', form?.community);
    }
    if (form?.location) {
      formData.append('location', form?.location);
    }
    formData.append('category', form?.category);
    formData.append('author', isAdmin ? form?.promoterAgent : user?.id);
    formData.append('promoter', isAdmin ? user?.id : form?.promoterAgent);
    formData.append('status', 'waiting');

    fetch(`${api.defaults.baseURL}/projects/`, {
      method: 'post',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then(async (res) => {
        if (res.status == 201) {
          const createdIdea = await res.json();
          router.replace({ pathname: '/pre-register', params: { idea: JSON.stringify(createdIdea) } });
        } else {
          setLoadingMessage(['error', 'Erro ao cadastrar ideia. Tente novamente mais tarde']);
        }
      })
      .catch(() => {
        setLoadingMessage(['error', 'Erro ao cadastrar ideia. Tente novamente mais tarde']);
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      });
  };

  const handleFieldChange = (field: string, newValue: any) => {
    switch (field) {
      case 'title':
        validateTitle(newValue);
        break;
      case 'description':
        validateDescription(newValue);
        break;
      case 'category':
        validateCategory(newValue);
        break;
      case 'city':
        validateCity(newValue);
        break;
      case 'neighborhood':
        validateNeighborhood(newValue);
        break;
      default:
        break;
    }
  };

  const validateTitle = (newValue: string) => {
    setForm({ ...form, title: newValue });
    if (!newValue) {
      setErrors({ ...errors, title: 'Este campo é obrigatório' });
      return false;
    } else {
      setErrors({ ...errors, title: '' });
      return true;
    }
  };

  const validateDescription = (newValue: string) => {
    setForm({ ...form, description: newValue });
    if (!newValue) {
      setErrors({ ...errors, description: 'Este campo é obrigatório' });
      return false;
    } else {
      setErrors({ ...errors, description: '' });
      return true;
    }
  };

  const validateCategory = (newValue: string) => {
    setForm({ ...form, category: newValue });
    if (!newValue) {
      setErrors({ ...errors, category: 'Este campo é obrigatório' });
      return false;
    } else {
      setErrors({ ...errors, category: '' });
      return true;
    }
  };

  const validateCity = (newValue: string) => {
    if (form?.city !== newValue) getCityNeighborhoods(newValue);
    setForm({ ...form, city: newValue });
    if (!newValue) {
      setErrors({ ...errors, city: 'Este campo é obrigatório' });
      return false;
    } else {
      setErrors({ ...errors, city: '' });
      return true;
    }
  };

  const validateNeighborhood = (newValue: string) => {
    setForm({ ...form, neighborhood: newValue });
    if (!newValue) {
      setErrors({ ...errors, neighborhood: 'Este campo é obrigatório' });
      return false;
    } else {
      setErrors({ ...errors, neighborhood: '' });
      return true;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} status={loadingMessage[0]} message={loadingMessage[1]} />

      <View style={styles.header}>
        <CustomText style={styles.title}>Ideia de Projeto</CustomText>
      </View>
      <ScrollView keyboardShouldPersistTaps='handled'>
        <View style={styles.card}>
          <FormField title='Título' required='true' value={form?.title} handleChangeText={(newValue: any) => handleFieldChange('title', newValue)} errorMessage={errors.title} />
          <FormField title={isAdmin ? 'Descreva a ideia do agente cultural' : 'Conte um pouco sobre a sua ideia'} size='bg' required='true' value={form?.description} multiline={true} handleChangeText={(newValue: any) => handleFieldChange('description', newValue)} errorMessage={errors.description} />
          <FormSelectField title='Categoria' required='true' selected={form?.category} array={categories} label='name' value='id' placeholder='Selecione' handleSelectChange={(newValue: any) => handleFieldChange('category', newValue)} errorMessage={errors.category} />
          <FormSelectField title={isAdmin ? 'Agente Cultural' : 'Mobilizador(a)'} required={isAdmin} selected={form?.promoterAgent} array={isAdmin ? agents : promoters} label='full_name' value='id' placeholder='Nenhum(a)' handleSelectChange={(e: any) => setForm({ ...form, promoterAgent: e })} />
          <FormSelectField title='Município' required='true' selected={form?.city} array={cities} label='name' value='id' placeholder='Selecione' handleSelectChange={(newValue: any) => handleFieldChange('city', newValue)} errorMessage={errors.city} />
          <FormSelectField title='Bairro' required='true' selected={form?.neighborhood} disabled={!form?.city} array={neighborhoods} label='name' value='id' placeholder='Selecione' handleSelectChange={(newValue: any) => handleFieldChange('neighborhood', newValue)} errorMessage={errors.neighborhood} />
          <FormField title='Comunidade' value={form?.community} handleChangeText={(e: any) => setForm({ ...form, community: e })} />
          <FormField title='Local de realização' size='md' value={form?.location} handleChangeText={(e: any) => setForm({ ...form, location: e })} />

          {form?.image ? (
            <View style={styles.buttonArea}>
              <CustomButton title='Substituir imagem' width={150} type='Secondary' handlePress={async () => pickImage()} />
              <Image source={{ uri: form?.image?.uri.replace('http', 'https') }} style={styles.image} />
            </View>
          ) : (
            <View style={styles.buttonArea}>
              <CustomButton title='Escolha uma imagem' width={150} type='Secondary' handlePress={async () => pickImage()} />
            </View>
          )}

          <View style={styles.buttonArea}>
            <CustomButton title='Confirmar' type='Primary' handlePress={() => submit()} />
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
