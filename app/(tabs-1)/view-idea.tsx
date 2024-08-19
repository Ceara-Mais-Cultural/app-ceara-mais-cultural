import { View, StyleSheet, ScrollView, Image, Text, TouchableOpacity, Pressable, Modal, Alert } from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, icons, images } from '@/constants';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import CustomText from '@/components/CustomText';
import { useFocusEffect } from '@react-navigation/native';
import AuthService from '../services/authService';
import CustomButton from '@/components/CustomButton';
import PostDataService from '../services/postDataService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Loader from '@/components/Loader';

const ViewIdea = () => {
  const { idea } = useLocalSearchParams();
  const [user, setUser] = useState<any>();
  const [role, setRole] = useState('');
  const [parsedIdea, setParsedIdea] = useState<any>(idea);
  const [isModalVisible, setIsModalVisible] = useState<any>(idea);
  const [action, setAction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null as any);

  useFocusEffect(
    useCallback(() => {
      AuthService.getUserData().then((userData: any) => {
        const user = JSON.parse(userData);
        setUser(user);
        const role = AuthService.getPermissionLevel(user);
        setRole(role);
      });
      setParsedIdea(JSON.parse(idea as any));
    }, [idea])
  );

  const downloadAndShareFile = async () => {
    setStatus([]);
    try {
      // URL do arquivo que você deseja baixar
      const fileUrl = parsedIdea.file.replace('http', 'https');
      const fileUri = FileSystem.documentDirectory + 'Termo de Abertura do Projeto.pdf';

      // Baixar o arquivo
      const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);

      // Compartilhar o arquivo se possível
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        setStatus(['error', 'Erro ao compartilhar documento. Tente novamente mais tarde']);
      }
    } catch (error) {
      setStatus(['error', 'Erro ao baixar documento. Tente novamente mais tarde']);
    }
  };

  const openModal = (approve: boolean) => {
    setAction(approve);
    setIsModalVisible(true);
  };

  const closeModal = (modalAction: boolean) => {
    setIsModalVisible(false);
    setStatus([]);
    if (modalAction) {
      setLoading(true);
      const idIdea = parsedIdea?.id;
      const idUser = user?.id;
      const body = {
        project: idIdea,
        user: idUser,
        vote: action ? 'approved' : 'declined',
      };
      PostDataService.voteIdea(idIdea, body)
        .then(() => {
          setStatus(['success', 'Voto salvo com sucesso!']);
          setTimeout(() => {
            router.replace('/ideas');
          }, 2000);
        })
        .catch(() => {
          setStatus(['error', 'Erro ao salvar voto. Tente novamente mais tarde']);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} message={status[1]} status={status[0]} />

      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/ideas')}>
          <Image style={styles.arrowBack} source={icons.arrowBack} resizeMode='contain' tintColor={colors.white} />
        </Pressable>
        <CustomText style={styles.pageTitle}>Visualizar Ideia</CustomText>
        <CustomText>{'          '}</CustomText>
      </View>

      {/* MODAL */}
      <Modal animationType='fade' transparent={true} visible={isModalVisible} onRequestClose={() => closeModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CustomText style={{ textAlign: 'center' }}>{`Você tem certeza que deseja ${action ? 'APROVAR' : 'RECUSAR'} essa ideia?`}</CustomText>

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
          <CustomText style={styles.title}>{parsedIdea?.title}</CustomText>
          {/* Imagem */}
          <View style={{ height: 200, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
            <Image source={{ uri: parsedIdea?.image?.replace('http', 'https') }} style={styles.image} resizeMode='contain' />
          </View>

          {/* Detalhes do Projeto */}
          <View style={styles.fieldArea}>
            <CustomText style={styles.sectionTitle}>Detalhes do Projeto</CustomText>
            <CustomText style={styles.label}>
              Identificador: <CustomText>{parsedIdea?.id}</CustomText>
            </CustomText>
            <CustomText style={styles.label}>
              Status: <CustomText>{parsedIdea?.status === 'approved' ? 'Aprovada' : parsedIdea?.status === 'pending' ? 'Em análise' : parsedIdea?.status === 'declined' ? 'Recusada' : 'Esperando documentação'}</CustomText>
            </CustomText>
          </View>

          {/* Descrição */}
          <View style={styles.fieldArea}>
            <CustomText style={styles.sectionTitle}>Descrição</CustomText>
            <CustomText>{parsedIdea?.description}</CustomText>
          </View>

          <View>
            <CustomText style={styles.sectionTitle}>Localização</CustomText>

            {/* Município */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>
                Município: <CustomText>{parsedIdea?.city_name}</CustomText>
              </CustomText>
            </View>
            {/* Bairro */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>
                Bairro: <CustomText>{parsedIdea?.neighborhood_name}</CustomText>
              </CustomText>
            </View>
            {/* Comunidade */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>
                Comunidade: <CustomText>{parsedIdea?.community !== 'undefined' ? parsedIdea?.community : ''}</CustomText>
              </CustomText>
            </View>
            {/* Local */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>
                Local: <CustomText>{parsedIdea?.location}</CustomText>
              </CustomText>
            </View>
          </View>

          <View>
            <CustomText style={styles.sectionTitle}>Informações Adicionais</CustomText>

            {/* Categoria */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>
                Categoria: <CustomText>{parsedIdea?.category_name}</CustomText>
              </CustomText>
            </View>

            {/* Agente Cultural */}
            {role !== 'Mobilizador' && (
              <View style={styles.fieldArea}>
                <CustomText style={styles.label}>
                  Agente Cultural: <CustomText>{parsedIdea?.author_name}</CustomText>
                </CustomText>
              </View>
            )}

            {/* Mobilizador */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>
                Mobilizador: <CustomText>{parsedIdea?.promoter_name}</CustomText>
              </CustomText>
            </View>

            {/* Data de Submissão */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>
                Data de Submissão: <CustomText>{parsedIdea?.created_at}</CustomText>
              </CustomText>
            </View>
          </View>

          {/* Documentos */}
          <CustomText style={styles.sectionTitle}>Documentos</CustomText>
          <View style={styles.fieldArea}>
            {parsedIdea.file ? (
              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <CustomText>Termo de Abertura</CustomText>
                <TouchableOpacity onPress={async () => downloadAndShareFile()} style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', borderRadius: 5, borderWidth: 1, borderColor: colors.menu_secundary, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.white }}>
                  <CustomText style={{ color: colors.menu_secundary, top: 2 }}>Download</CustomText>
                  <Image style={{ width: 20, height: 20, marginLeft: 10 }} source={icons.download} tintColor={colors.menu_secundary} resizeMode='contain' />
                </TouchableOpacity>
              </View>
            ) : (
              <CustomText>Nenhum documento anexado.</CustomText>
            )}
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
                <CustomText>Você já {parsedIdea.status == 'approved' ? 'aprovou' : 'recusou'} essa ideia</CustomText>
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
  pageTitle: {
    color: colors.white,
    fontFamily: 'PoppinsBold',
    fontSize: 18,
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldArea: {
    marginBottom: 5,
  },
  image: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 5,
  },
  label: {
    fontFamily: 'PoppinsBold',
    color: colors.primary,
  },
  title: {
    fontFamily: 'PoppinsBold',
    marginHorizontal: 'auto',
    fontSize: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 0,
  },

  // MODAL
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
