import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Pressable, Modal, Alert } from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, icons } from '@/constants';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import CustomText from '@/components/CustomText';
import { useFocusEffect } from '@react-navigation/native';
import AuthService from '../services/authService';
import CustomButton from '@/components/CustomButton';
import PostDataService from '../services/postDataService';

const ViewIdea = () => {
  const { idea } = useLocalSearchParams();
  const [user, setUser] = useState<any>();
  const [role, setRole] = useState('');
  const [parsedIdea, setParsedIdea] = useState<any>(idea);
  const [isModalVisible, setIsModalVisible] = useState<any>(idea);
  const [action, setAction] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AuthService.getUserData().then((userData: any) => {
        const user = JSON.parse(userData);
        setUser(user);
        const role = AuthService.getPermissionLevel(user);
        setRole(role);
      });
      setParsedIdea(JSON.parse(idea));
    }, [idea])
  );

  const openModal = (approve: boolean) => {
    setAction(approve);
    setIsModalVisible(true);
  };

  const closeModal = (modalAction: boolean) => {
    setIsModalVisible(false);
    if (modalAction) {
      const idIdea = parsedIdea.id;
      const idUser = user.id;
      const body = {
        project: idIdea,
        user: idUser,
        vote: action ? 'approved' : 'declined',
      };
      PostDataService.voteIdea(idIdea, body)
        .then((res) => {
          Alert.prompt(res.data);
        })
        .catch((error) => {
          console.error('Erro ao registrar voto.');
        });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/ideas')}>
          <Image style={styles.arrowBack} source={icons.arrowBack} resizeMode='contain' tintColor={colors.white} />
        </Pressable>
        <CustomText style={styles.title}>{parsedIdea?.title}</CustomText>
        <CustomText>{'          '}</CustomText>
      </View>
      {/* MODAL */}
      <Modal animationType='fade' transparent={true} visible={isModalVisible} onRequestClose={() => closeModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CustomText style={{ textAlign: 'center' }}>{`Você tem certeza que deseja ${action ? 'APROVAR' : 'RECUSAR'} essa ideia? Essa ação é irreversível.`}</CustomText>

            <View style={styles.modalButtons}>
              <CustomButton title='Não' type='Secondary' width={100} height={50} handlePress={() => closeModal(false)} />
              <CustomButton title='Sim' type='Primary' width={100} height={50} handlePress={() => closeModal(true)} />
            </View>
          </View>
        </View>
      </Modal>
      {/* END MODAL */}
      <ScrollView>
        <View style={styles.card}>
          {/* Status */}
          <View style={styles.status}>
            <CustomText style={styles.label}>Status: {parsedIdea?.status === 'approved' ? 'Aprovado' : parsedIdea?.status === 'pending' ? 'Em análise' : 'Recusado'}</CustomText>
          </View>

          {/* Imagem */}
          <View style={{ height: 200, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginVertical: 10, borderWidth: 1, borderColor: colors.primary }}>
            <CustomText style={styles.label}>Imagem</CustomText>
          </View>

          {/* Descrição */}
          <View style={styles.fieldArea}>
            <CustomText style={styles.label}>Descrição</CustomText>
            <CustomText>{parsedIdea?.description}</CustomText>
          </View>

          {/* 2 Colunas */}
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Coluna Esquerda */}
            <View>
              {/* Município */}
              <View style={styles.fieldArea}>
                <CustomText style={styles.label}>Município</CustomText>
                <CustomText>{parsedIdea?.city_name}</CustomText>
              </View>
              {/* Comunidade */}
              <View style={styles.fieldArea}>
                <CustomText style={styles.label}>Comunidade</CustomText>
                <CustomText>{parsedIdea?.community ? parsedIdea?.community : '-'}</CustomText>
              </View>
            </View>

            {/* Coluna Direita */}
            <View>
              {/* Bairro */}
              <View style={styles.fieldArea}>
                <CustomText style={styles.label}>Bairro</CustomText>
                <CustomText>{parsedIdea?.neighborhood_name}</CustomText>
              </View>
              {/* Categoria */}
              <View style={styles.fieldArea}>
                <CustomText style={styles.label}>Categoria</CustomText>
                <CustomText>{parsedIdea?.category_name}</CustomText>
              </View>
            </View>
          </View>

          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Local */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>Local</CustomText>
              <CustomText>{parsedIdea?.location}</CustomText>
            </View>

            {/* Data de Submissão */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>Data</CustomText>
              <CustomText>{parsedIdea?.created_at}</CustomText>
            </View>
          </View>

          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Agente Cultural */}
            {role !== 'Mobilizador' && (
              <View style={styles.fieldArea}>
                <CustomText style={styles.label}>Agente Cultural</CustomText>
                <CustomText>{parsedIdea?.author_name}</CustomText>
              </View>
            )}

            {/* Mobilizador */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>Mobilizador</CustomText>
              <CustomText>{parsedIdea?.promoter_name}</CustomText>
            </View>
          </View>

          {/* Documentos */}
          <View style={styles.fieldArea}>
            <CustomText style={styles.label}>Documentos</CustomText>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <CustomText>Termo de Abertura</CustomText>
              <TouchableOpacity style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', borderRadius: 5, borderWidth: 1, borderColor: colors.menu_secundary, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.white }}>
                <CustomText style={{ color: colors.menu_secundary, top: 2 }}>Download</CustomText>
                <Image style={{ width: 20, height: 20, marginLeft: 10 }} source={icons.download} tintColor={colors.menu_secundary} resizeMode='contain' />
              </TouchableOpacity>
            </View>
          </View>

          {(parsedIdea?.status == 'pending' && role == 'Comissão' && (
            <View style={styles.evaluationArea}>
              <CustomText style={styles.evaluationText}>Avaliação</CustomText>

              <CustomButton title='Aprovar' type='Primary' width={200} height={50} style={{ marginHorizontal: 'auto' }} handlePress={() => openModal(true)} />
              <CustomButton title='Recusar' type='Secondary' width={200} height={50} style={{ marginHorizontal: 'auto' }} handlePress={() => openModal(false)} />
            </View>
          )) ||
            (role == 'Comissão' && (
              <View style={styles.evaluationArea}>
                <CustomText style={styles.evaluationText}>Avaliação</CustomText>
                <CustomText>Essa ideia já foi votada e {parsedIdea.status == 'approved' ? 'aprovada' : 'recusada'}.</CustomText>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewIdea;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background_light,
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    display: 'flex',
    width: '100%',
    backgroundColor: colors.background_dark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    padding: 15,
  },
  arrowBack: {
    width: 40,
    height: 40,
  },
  title: {
    color: colors.white,
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    maxWidth: '80%',
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.off_white,
    padding: 25,
    margin: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  status: {
    marginHorizontal: 'auto',
  },
  fieldArea: {
    marginVertical: 10,
  },
  label: {
    fontFamily: 'PoppinsBold',
  },
  evaluationArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  evaluationText: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    marginTop: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: 300,
    borderRadius: 25,
    elevation: 5,
  },
  modalButtons: {
    marginTop: 25,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
