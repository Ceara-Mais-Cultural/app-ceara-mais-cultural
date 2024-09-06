import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants';
import CustomButton from '@/components/CustomButton';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import CustomText from '@/components/CustomText';
import * as Sharing from 'expo-sharing';
import { api } from '../services/api';
import AuthService from '../services/authService';
import Loader from '@/components/Loader';

const SendDocument = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState([] as any);
  const { idea } = useLocalSearchParams();
  const [parsedIdea, setParsedIdea] = useState<any>(null);
  const [authToken, setAuthToken] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const parsed = JSON.parse(idea as any);
      setParsedIdea(parsed);
      AuthService.getAuthToken().then((token) => {
        setAuthToken(token);
      });
    }, [idea])
  );

  const uploadDocument = async () => {
    setStatus([]);
    setLoading(true);
    const pickedFile = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    const assets = pickedFile.assets;
    if (!assets) {
      setLoading(false);
      return;
    }
    const file = assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.mimeType,
      name: file.name,
    } as any);

    formData.append('title', parsedIdea.title);
    formData.append('description', parsedIdea.description);
    formData.append('city', parsedIdea.city);
    formData.append('neighborhood', parsedIdea.neighborhood);
    if (!!parsedIdea.community) {
      formData.append('community', parsedIdea.community);
    }
    formData.append('location', parsedIdea.location);
    formData.append('category', parsedIdea.category);
    formData.append('author', parsedIdea.author);
    if (!!parsedIdea.promoter) {
      formData.append('promoter', parsedIdea.promoter);
    }
    formData.append('status', 'pending');

    const response = await fetch(`${api.defaults.baseURL}/projects/${parsedIdea.id}/`, {
      method: 'put',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.status == 200) {
      setStatus(['success', 'Documento enviado com sucesso! Ideia submetida para análise.']);
      setTimeout(() => {
        setLoading(false);
        router.navigate('/ideas');
      }, 3000);
    } else {
      setStatus(['error', 'Erro ao enviar documento. Tente novamente mais tarde']);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const downloadAndShareFile = async () => {
    setStatus([]);
    try {
      // URL do arquivo que você deseja baixar
      const fileUrl = 'https://api.arya.ai/images/test.pdf';
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Loader visible={loading} message={status[1]} status={status[0]} />

      <ScrollView style={styles.background} keyboardShouldPersistTaps='handled'>
        <View style={styles.card}>
          <CustomText style={styles.title}>Enviar Documento</CustomText>
          <CustomText style={styles.text}>Após preencher o documento com os detalhes da sua ideia, envie-o aqui. Não se preocupe, você poderá voltar para essa tela mais tarde.</CustomText>
          <View style={styles.buttonArea}>
            <CustomButton title='Baixar modelo' type='Secondary' handlePress={async () => downloadAndShareFile()} />
          </View>
          <View style={styles.buttonArea}>
            <CustomButton title='Enviar documento' type='Primary' handlePress={async () => uploadDocument()} />
          </View>

          <CustomText style={styles.subTitle}>Importante!</CustomText>
          <CustomText style={styles.text}>A sua ideia só sera avaliada após o envio do documento preenchido. Boa sorte!</CustomText>
          <View style={styles.buttonArea}>
            <CustomButton
              title='Continuar depois'
              type='Secondary'
              handlePress={() => {
                router.push('/ideas');
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SendDocument;

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
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 30,
  },

  text: {
    color: colors.text,
    marginBottom: 25,
    textAlign: 'justify',
  },

  buttonArea: {
    gap: 15,
    marginBottom: 25,
    marginHorizontal: 'auto',
  },

  subTitle: {
    color: colors.text,
    fontFamily: 'PoppinsBold',
    marginHorizontal: 'auto',
    fontSize: 18,
    marginBottom: 15,
  },
});
