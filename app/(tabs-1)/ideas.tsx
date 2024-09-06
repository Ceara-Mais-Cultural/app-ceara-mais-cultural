import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import AuthService from '../services/authService';
import getDataService from '../services/getDataService';
import CustomText from '@/components/CustomText';
import FormSelectField from '@/components/FormSelectField';
import GetDataService from '../services/getDataService';
import { colors, icons } from '@/constants';
import AccordionItem from '@/components/AccordionItem';
import Loader from '@/components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IdeaCard from '@/components/IdeaCard';

const Ideas = () => {
  const initialFilter = {
    title: '',
    category: '',
    city: '',
    neighborhood: '',
    community: '',
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filter, setFilter] = useState<any>(initialFilter);
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  const [ideas, setIdeas] = useState([]);
  const [initialIdeas, setInitialIdeas] = useState([]);
  const filteredIdeas = ideas.filter((idea: any) => idea.title.toLowerCase().includes(searchText.toLowerCase()));

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('Agente Cultural');

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState([] as any);

  useEffect(() => {
    loadScreen();
  }, []);

  const loadScreen = async () => {
    setFilter(initialFilter);
    const storedUserData = await AsyncStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      const role = AuthService.getPermissionLevel(user);
      setUser(user);
      setRole(role);
      getCities();
      getCityNeighborhoods(user?.city);
      if (role === 'Agente Cultural') getIdeas(user?.id);
      else if (role === 'Mobilizador') getIdeas(user?.id, user?.city);
      else getIdeas();
    }
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
        setLoadingMessage(['error', 'Erro ao recuperar ideias. Tente novamente mais tarde']);
      }
    );
  };

  const handleViewCardNav = (idea: any) => {
    if (role === 'Comissão' || idea.status !== 'waiting') router.push({ pathname: '/view-idea', params: { idea: JSON.stringify(idea) } });
    else router.push({ pathname: '/send-document', params: { idea: JSON.stringify(idea) } });
  };

  const openFilter = () => {
    setFilter({ ...filter, city: user?.city, neighborhood: user?.neighborhood, community: user?.community });
    getCities();
    getCategories();
    setIsModalVisible(true);
  };

  const closeFilter = (action: boolean) => {
    let filteredData: any = [...initialIdeas];
    if (action) {
      if (filter.title) {
        filteredData = filteredData.filter((idea: any) => idea.title.toLowerCase().includes(filter.title.toLowerCase()));
      }
      if (filter.category) {
        filteredData = filteredData.filter((idea: any) => idea.category === filter.category);
      }
      if (filter.city) {
        filteredData = filteredData.filter((idea: any) => idea.city === filter.city);
      }
      if (filter.neighborhood) {
        filteredData = filteredData.filter((idea: any) => idea.neighborhood === filter.neighborhood);
      }
      if (filter.community) {
        filteredData = filteredData.filter((idea: any) => idea.community.toLowerCase().includes(filter.community.toLowerCase()));
      }
      if (filteredData.length === 0) setIdeas(filteredData);
      // else if (filteredData.every((value: any, index: any) => value === initialIdeas[index])) {
      //   setIdeas(initialIdeas);
      else {
        setIdeas(filteredData);
      }
    } else {
      setFilter(initialFilter);
      setIdeas(initialIdeas);
    }
    setIsModalVisible(false);
  };

  const getCategories = () => {
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
    if (!cityId) return;
    setLoading(true);
    setLoadingMessage([]);
    setFilter({ ...filter, neighborhood: '' });
    GetDataService.getNeighborhoods(cityId)
      .then((res) => {
        setNeighborhoods(res.data);
      })
      .catch(() => {
        setLoadingMessage(['error', 'Erro ao recuperar bairros. Tente novamente mais tarde']);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 80 }}>
      <Loader visible={loading} status={loadingMessage[0]} message={loadingMessage[1]} />

      {/* MODAL */}
      <Modal animationType='fade' transparent={true} visible={isModalVisible} onRequestClose={() => closeFilter(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalTitle}>Filtros</CustomText>
            <FormField title='Título' width='80%' value={filter.title} handleChangeText={(e: any) => setFilter({ ...filter, title: e })} />
            <FormSelectField title='Categoria' selected={filter.category} array={categories} label='name' value='id' placeholder='Selecione' handleSelectChange={(e: any) => setFilter({ ...filter, category: e })} />
            <FormSelectField
              title='Município'
              selected={filter.city}
              array={cities}
              label='name'
              value='id'
              disabled={role !== 'Comissão'}
              placeholder='Selecione'
              handleSelectChange={(e: any) => {
                setFilter({ ...filter, city: e });
                getCityNeighborhoods(e);
              }}
            />
            <FormSelectField title='Bairro' selected={filter.neighborhood} array={neighborhoods} label='name' value='id' disabled={role !== 'Comissão'} placeholder='Selecione' handleSelectChange={(e: any) => setFilter({ ...filter, neighborhood: e })} />
            <FormField title='Comunidade' width='80%' value={filter.community} handleChangeText={(e: any) => setFilter({ ...filter, community: e })} />

            <View style={styles.filterButtons}>
              <CustomButton title='Limpar' type='Secondary' width={135} height={50} handlePress={() => closeFilter(false)} />
              <CustomButton title='Aplicar' type='Primary' width={135} height={50} handlePress={() => closeFilter(true)} />
            </View>
          </View>
        </View>
      </Modal>
      {/* END MODAL */}

      <ScrollView style={styles.background} keyboardShouldPersistTaps='handled' refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <View style={styles.titleArea}>
            <Pressable onPress={() => router.replace('/sign-in')}>
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

        <View style={styles.labelsArea}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <View style={[styles.statusBall, { backgroundColor: colors.danger }]} />
            <CustomText>Recusada</CustomText>
          </View>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <View style={[styles.statusBall, { backgroundColor: colors.pending }]} />
            <CustomText>Em análise</CustomText>
          </View>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <View style={[styles.statusBall, { backgroundColor: colors.confirm }]} />
            <CustomText>Aprovada</CustomText>
          </View>
        </View>

        {role === 'Agente Cultural' && (
          <View style={styles.content}>
            <AccordionItem title='Minhas Ideias' isExpanded={true}>
              {(!loading && filteredIdeas.length > 0 && (
                <View style={styles.cardsArea}>
                  {filteredIdeas.map((idea: any) => (
                    <IdeaCard key={idea.id} idea={idea} onPress={() => handleViewCardNav(idea)} />
                  ))}
                </View>
              )) || (
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <Text>Nenhuma ideia cadastrada!</Text>
                  <Text style={{ marginBottom: 25 }}>Clique abaixo para submeter uma nova ideia.</Text>

                  <CustomButton title='Criar Ideia' type='Secondary' width={135} height={50} handlePress={() => router.replace('/create')} />
                </View>
              )}
            </AccordionItem>
          </View>
        )}

        {role === 'Mobilizador' && (
          <>
            <View style={styles.content}>
              <AccordionItem title={'Ideias Promovidas em ' + user?.city_name} isExpanded={true}>
                {(!loading && filteredIdeas.length > 0 && (
                  <View style={styles.cardsArea}>
                    {filteredIdeas.map((idea: any) => {
                      if (idea.status !== 'approved') {
                        return <IdeaCard key={idea.id} idea={idea} onPress={() => handleViewCardNav(idea)} />;
                      }
                    })}
                  </View>
                )) || (
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <Text>Nenhuma ideia cadastrada!</Text>
                    <Text style={{ marginBottom: 25 }}>Clique abaixo para submeter uma nova ideia.</Text>

                    <CustomButton title='Criar Ideia' type='Secondary' width={135} height={50} handlePress={() => router.replace('/create')} />
                  </View>
                )}
              </AccordionItem>
            </View>

            <View style={styles.content}>
              <AccordionItem title={'Ideias Aprovadas de ' + user?.city_name}>
                {(!loading && filteredIdeas.length > 0 && (
                  <View style={styles.cardsArea}>
                    {filteredIdeas.map((idea: any) => {
                      if (idea.status === 'approved') {
                        return <IdeaCard key={idea.id} idea={idea} onPress={() => handleViewCardNav(idea)} />;
                      }
                    })}
                  </View>
                )) || <Text style={{ marginHorizontal: 'auto' }}>Nenhuma ideia aprovada!</Text>}
              </AccordionItem>
            </View>
          </>
        )}

        {role === 'Comissão' &&
          cities.map((city: any, idx: number) => (
            <View key={city.id} style={styles.content}>
              <CustomText style={styles.cardTitle}>{city.name}</CustomText>
              <View style={styles.subCard}>
                <AccordionItem title={`Ideias Submetidas (${filteredIdeas.filter((idea: any) => idea.status !== 'approved' && idea.status !== 'waiting' && idea.city_name === city.name).length})`} isExpanded={idx === 0}>
                  {(!loading && filteredIdeas.length > 0 && (
                    <View style={styles.cardsArea}>
                      {filteredIdeas.map((idea: any) => {
                        if (idea.status !== 'approved' && idea.status !== 'waiting' && idea.city_name === city.name) {
                          return <IdeaCard key={idea.id} idea={idea} onPress={() => handleViewCardNav(idea)} />;
                        }
                      })}
                    </View>
                  )) || <Text style={{ marginHorizontal: 'auto' }}>Nenhuma ideia submetida!</Text>}
                </AccordionItem>
              </View>

              <View style={[{ borderWidth: 0.5, borderColor: colors.text, marginTop: 10, marginBottom: 10 }]}></View>

              <View style={styles.subCard}>
                <AccordionItem title={`Ideias Aprovadas (${filteredIdeas.filter((idea: any) => idea.status === 'approved' && idea.city_name === city.name).length})`} isExpanded={false}>
                  {(!loading && filteredIdeas.length > 0 && (
                    <View style={styles.cardsArea}>
                      {filteredIdeas.map((idea: any) => {
                        if (idea.status === 'approved' && idea.city_name === city.name) {
                          return <IdeaCard key={idea.id} idea={idea} onPress={() => handleViewCardNav(idea)} />;
                        }
                      })}
                    </View>
                  )) || <Text style={{ marginHorizontal: 'auto' }}>Nenhuma ideia aprovada!</Text>}
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

  labelsArea: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    paddingTop: 10,
    backgroundColor: colors.off_white,
    marginVertical: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statusBall: {
    borderRadius: 50,
    width: 15,
    height: 15,
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
