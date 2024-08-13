import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Pressable, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import AuthService from '../services/authService';
import getDataService from '../services/getDataService';
import CustomText from '@/components/CustomText';
import { useFocusEffect } from '@react-navigation/native';
import FormSelectField from '@/components/FormSelectField';
import GetDataService from '../services/getDataService';
import { colors, icons } from '@/constants';
import AccordionItem from '@/components/AccordionItem';
import Loader from '@/components/Loader';

const Ideas = () => {
  const initialFilter = {
    titulo: '',
    categoria: '',
    municipio: '',
    bairro: '',
    comunidade: '',
  };
  const [filter, setFilter] = useState<any>(initialFilter);
  const [categorias, setCategorias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [initialIdeas, setInitialIdeas] = useState([]);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('Agente Cultural');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null as any);

  useFocusEffect(
    useCallback(() => {
      loadScreen();
    }, [])
  );

  const filteredIdeas = ideas.filter((idea: any) => idea.title.toLowerCase().includes(searchText.toLowerCase()));

  const loadScreen = () => {
    setFilter(initialFilter);
    setLoading(true);
    AuthService.getUserData().then((userData: any) => {
      const user = JSON.parse(userData);
      setUser(user);
      const role = AuthService.getPermissionLevel(user);
      setRole(role);
      getMunicipios();
      getMunicipioBairros(user?.city || 2);
      if (role === 'Agente Cultural') getIdeas(user?.id || 4);
      else if (role === 'Mobilizador') getIdeas(user?.id || 4, user?.city || 2);
      else getIdeas();
    });
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadScreen();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getIdeas = (idUser: any = null, idCity: any = null) => {
    getDataService.getProjects(idUser, idCity).then(
      (res) => {
        res.data.forEach((idea: any) => {
          idea.created_at = new Date(idea.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        });
        setInitialIdeas(res.data);
        setIdeas(res.data);
        setLoading(false);
      },
      () => {
        setStatus('error');
      }
    );
  };

  const _IdeaCard = ({ idea, onPress }: any) => {
    if (!idea || typeof idea !== 'object' || Object.keys(idea).length === 0) {
      return null;
    }

    return (
      <TouchableOpacity style={styles.ideaCard} onPress={onPress}>
        <View style={[styles.statusBall, idea?.status === 'approved' ? { backgroundColor: colors.confirm } : idea?.status === 'pending' ? { backgroundColor: colors.pending } : { backgroundColor: colors.danger }]} />
        <View style={[styles.cardContent]}>
          <CustomText style={{ fontSize: 15 }}>{idea?.title}</CustomText>
          <CustomText style={{ fontSize: 12 }}>
            {idea?.category_name} - {idea?.city_name}
          </CustomText>
          <CustomText style={{ fontSize: 12 }}>Submetido em: {idea?.created_at}</CustomText>
        </View>

        <View style={{ marginRight: 15, width: 15, top: 5 }}>{idea?.status == 'waiting' && <CustomText style={{ color: colors.danger, fontSize: 24, marginTop: 7 }}>*</CustomText>}</View>

        <View>
          <Image style={{ width: 30, height: 30 }} source={icons.chevronForward} resizeMode='contain' tintColor={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  const handleViewCardNav = (idea: any) => {
    if (role === 'Comissão' || idea.status !== 'waiting') router.push({ pathname: '/view-idea', params: { idea: JSON.stringify(idea) } });
    else router.push({ pathname: '/send-document', params: { idea: JSON.stringify(idea) } });
  };

  const openFilter = () => {
    setFilter({ ...filter, municipio: user.city, bairro: user.neighborhood, comunidade: user.comunity });
    getMunicipios();
    getCategories();
    setIsModalVisible(true);
  };

  const closeFilter = (action: boolean) => {
    let filteredData: any = [...initialIdeas];
    if (action) {
      if (filter.titulo) {
        filteredData = filteredData.filter((idea: any) => idea.title.toLowerCase().includes(filter.titulo.toLowerCase()));
      }
      if (filter.categoria) {
        filteredData = filteredData.filter((idea: any) => idea.category === filter.categoria);
      }
      if (filter.municipio) {
        filteredData = filteredData.filter((idea: any) => idea.city === filter.municipio);
      }
      if (filter.bairro) {
        filteredData = filteredData.filter((idea: any) => idea.neighborhood === filter.bairro);
      }
      if (filter.comunidade) {
        filteredData = filteredData.filter((idea: any) => idea.community.toLowerCase().includes(filter.comunidade.toLowerCase()));
      }
      if (filteredData.length === 0) setIdeas(filteredData);
      else if (filteredData.every((value: any, index: any) => value === initialIdeas[index])) {
        setIdeas(initialIdeas);
      } else {
        setIdeas(filteredData);
      }
    } else {
      setFilter(initialFilter);
      setIdeas(initialIdeas);
    }
    setIsModalVisible(false);
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

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 80 }}>
      <Loader visible={loading} errorMessage='Erro ao carregar ideias' successMessage='' status={status} />

      {/* MODAL */}
      <Modal animationType='fade' transparent={true} visible={isModalVisible} onRequestClose={() => closeFilter(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalTitle}>Filtros</CustomText>
            <FormField title='Título' width='80%' value={filter.titulo} handleChangeText={(e: any) => setFilter({ ...filter, titulo: e })} />
            <FormSelectField title='Categoria' selected={filter.categoria} array={categorias} label='name' value='id' placeholder='Selecione' handleSelectChange={(e: any) => setFilter({ ...filter, categoria: e })} />
            <FormSelectField
              title='Município'
              selected={filter.municipio}
              array={municipios}
              label='name'
              value='id'
              disabled={role !== 'Comissão'}
              placeholder='Selecione'
              handleSelectChange={(e: any) => {
                setFilter({ ...filter, municipio: e });
                getMunicipioBairros(e);
              }}
            />
            <FormSelectField title='Bairro' selected={filter.bairro} array={bairros} label='name' value='id' disabled={role !== 'Comissão'} placeholder='Selecione' handleSelectChange={(e: any) => setFilter({ ...filter, bairro: e })} />
            <FormField title='Comunidade' width='80%' value={filter.comunidade} handleChangeText={(e: any) => setFilter({ ...filter, comunidade: e })} />

            <View style={styles.filterButtons}>
              <CustomButton title='Limpar' type='Secondary' width={135} height={50} handlePress={() => closeFilter(false)} />
              <CustomButton title='Aplicar' type='Primary' width={135} height={50} handlePress={() => closeFilter(true)} />
            </View>
          </View>
        </View>
      </Modal>
      {/* END MODAL */}

      <ScrollView style={styles.background} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <View style={styles.titleArea}>
            <Pressable onPress={() => router.replace('/stages')}>
              <Image style={styles.arrowBack} source={icons.arrowBack} resizeMode='contain' tintColor={colors.white} />
            </Pressable>
            <CustomText style={styles.title}>Ideias</CustomText>
            <CustomText>{'          '}</CustomText>
          </View>
          <View style={styles.searchArea}>
            <FormField placeholder='Pesquise' title='' width='65%' value={searchText} handleChangeText={setSearchText} />
            <CustomButton title={Object.values(filter).some((value) => value !== '' && value !== null) ? 'Filtros *' : 'Filtros'} type='Primary' width={120} height={50} handlePress={() => openFilter()} />
          </View>
        </View>

        {role === 'Agente Cultural' && (
          <View style={styles.content}>
            <AccordionItem title='Minhas Ideias' isExpanded={true}>
              {(!loading && filteredIdeas.length > 0 && (
                <View style={styles.cardsArea}>
                  {filteredIdeas.map((idea: any) => (
                    <_IdeaCard key={idea.id} idea={idea} onPress={() => handleViewCardNav(idea)} />
                  ))}
                </View>
              )) || <Text style={{ marginHorizontal: 'auto' }}>Nenhum item encontrado!</Text>}
            </AccordionItem>
          </View>
        )}

        {role === 'Mobilizador' && (
          <>
            <View style={styles.content}>
              <AccordionItem title={'Ideias Promovidas em ' + user.city_name} isExpanded={true}>
                {(!loading && filteredIdeas.length > 0 && (
                  <View style={styles.cardsArea}>
                    {filteredIdeas.map((idea: any) => {
                      if (idea.status !== 'approved') {
                        return <_IdeaCard key={idea.id} idea={idea} onPress={() => handleViewCardNav(idea)} />;
                      }
                    })}
                  </View>
                )) || <Text style={{ marginHorizontal: 'auto' }}>Nenhum item encontrado!</Text>}
              </AccordionItem>
            </View>

            <View style={styles.content}>
              <AccordionItem title={'Ideias Aprovadas de ' + user.city_name}>
                {(!loading && filteredIdeas.length > 0 && (
                  <View style={styles.cardsArea}>
                    {filteredIdeas.map((idea: any) => {
                      if (idea.status === 'approved') {
                        return <_IdeaCard key={idea.id} idea={idea} onPress={() => handleViewCardNav(idea)} />;
                      }
                    })}
                  </View>
                )) || <Text style={{ marginHorizontal: 'auto' }}>Nenhum item encontrado!</Text>}
              </AccordionItem>
            </View>
          </>
        )}

        {role === 'Comissão' &&
          municipios.map((city: any) => (
            <View key={city.id} style={styles.content}>
              <CustomText style={styles.cardTitle}>{city.name}</CustomText>
              <View style={styles.subCard}>
                <AccordionItem title='Ideias Submetidas' isExpanded={true}>
                  {(!loading && filteredIdeas.length > 0 && (
                    <View style={styles.cardsArea}>
                      {filteredIdeas.map((idea: any) => {
                        if (idea.status !== 'approved' && idea.status !== 'waiting' && idea.city_name === city.name) {
                          return <_IdeaCard key={idea.id} idea={idea} onPress={() => handleViewCardNav(idea)} />;
                        }
                      })}
                    </View>
                  )) || <Text style={{ marginHorizontal: 'auto' }}>Nenhum item encontrado!</Text>}
                </AccordionItem>
              </View>

              <View style={[{ borderWidth: 0.5, borderColor: colors.text, marginTop: 10, marginBottom: 10 }]}></View>

              <View style={styles.subCard}>
                <AccordionItem title={'Ideias Aprovadas'}>
                  {(!loading && filteredIdeas.length > 0 && (
                    <View style={styles.cardsArea}>
                      {filteredIdeas.map((idea: any) => {
                        if (idea.status === 'approved' && idea.city_name === city.name) {
                          return <_IdeaCard key={idea.id} idea={idea} onPress={() => handleViewCardNav(idea)} />;
                        }
                      })}
                    </View>
                  )) || <Text style={{ marginHorizontal: 'auto' }}>Nenhum item encontrado!</Text>}
                </AccordionItem>
              </View>
            </View>
          ))}
      </ScrollView>

      <StatusBar backgroundColor={colors.background_dark} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background_light,
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
    marginBottom: 15,
  },

  titleArea: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: colors.white,
    fontSize: 25,
    fontFamily: 'PoppinsBold',
  },

  arrowBack: {
    width: 40,
    height: 40,
  },

  searchArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  content: {
    marginBottom: 15,
    marginHorizontal: 15,
    padding: 20,
    backgroundColor: colors.off_white,
    borderRadius: 20,
  },

  cardTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    width: '100%',
    maxWidth: 290,
  },

  subCard: {},

  cardsArea: {
    gap: 10,
  },

  ideaCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.stroke,
  },

  statusBall: {
    borderRadius: 50,
    width: 15,
    height: 15,
    marginRight: 15,
  },

  cardContent: {
    maxWidth: 210,
    width: '100%',
    marginRight: 15,
  },

  // MODAL
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 25,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 26,
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
    marginBottom: 10,
  },
  filterButtons: {
    marginTop: 25,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default Ideas;
