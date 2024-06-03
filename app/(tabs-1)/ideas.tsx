import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Pressable, RefreshControl } from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, icons } from '@/constants';
import { StatusBar } from 'expo-status-bar';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import AuthService from '../services/authService';
import getDataService from '../services/getDataService';
import CustomText from '@/components/CustomText';
import { useFocusEffect } from '@react-navigation/native';

const Ideas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadScreen();
    }, [])
  );

  const loadScreen = () => {
    AuthService.getUserData().then((userData: any) => {
      const user = JSON.parse(userData);
      const role = AuthService.getPermissionLevel(user);
      if (role === 'Agente Cultural') getIdeas(user.id);
      else if (role === 'Mobilizador') getIdeas(user.id, user.city);
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
    getDataService.getProjects(idUser, idCity).then((res) => {
      res.data.forEach((idea: any) => {
        idea.created_at = new Date(idea.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      });
      setIdeas(res.data);
      setLoading(false);
    });
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
    if (idea.status === 'waiting') {
      router.push({ pathname: '/send-document', params: { ideaId: idea.id } });
    } else {
      router.push({ pathname: '/view-idea', params: { idea: JSON.stringify(idea) } });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 80 }}>
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
            <FormField placeholder='Pesquise' title='' width='65%' />
            <CustomButton title='Filtros' type='Primary' width={120} height={50} />
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.contentTitleArea}>
            <CustomText style={styles.contentTitle}>Minhas Ideias</CustomText>
          </View>
          {(!loading && ideas.length > 0 && (
            <View style={styles.cardsArea}>
              {ideas.map((idea: any) => (
                <_IdeaCard key={idea.id} idea={idea} onPress={() => handleViewCardNav(idea)} />
              ))}
            </View>
          )) || <Text style={{ marginHorizontal: 'auto' }}>Nenhuma ideia cadastrada!</Text>}
        </View>
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

  content: {
    margin: 15,
    padding: 20,
    backgroundColor: colors.off_white,
    borderRadius: 20,
  },

  contentTitleArea: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  contentTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    marginBottom: 20,
  },

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
});

export default Ideas;
