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
  const [status, setStatus] = useState(null as any);
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
      setStatus('success');
      setTimeout(() => {
        router.navigate('ideas');
      }, 2000);
    } else {
      setStatus('error');
    }
    setLoading(false);
  };

  const downloadAndShareFile = async () => {
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
        Alert.alert('Erro ao baixar arquivo', 'Desculpe pelo transtorno. Tente novamente mais tarde.');
      }
    } catch (error) {
      Alert.alert('Erro ao baixar arquivo', 'Desculpe pelo transtorno. Tente novamente mais tarde.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>

      <Loader visible={loading} errorMessage='Erro ao enviar documento' successMessage='Documento enviado com sucesso!' status={status} />

      <ScrollView style={styles.background}>
        <View style={styles.card}>
          <CustomText style={styles.title}>Enviar Documento</CustomText>
          <CustomText style={styles.text}>Após preencher o documento de abertura de projeto que foi baixado no seu celular, envie-o aqui. Mas não se preocupe, você poderá voltar para essa tela mais tarde.</CustomText>
          <View style={styles.buttonArea}>
            <CustomButton title='Baixar modelo' width={150} type='Secondary' handlePress={async () => downloadAndShareFile()} />
          </View>
          <View style={styles.buttonArea}>
            <CustomButton title='Enviar documento' type='Primary' isLoading={loading} handlePress={async () => uploadDocument()} />
          </View>

          <CustomText style={styles.subTitle}>Importante!</CustomText>
          <CustomText style={styles.text}>A sua ideia só sera avaliada após o envio do documento devidamente preenchido. Boa sorte!</CustomText>
          <View style={styles.buttonArea}>
            <CustomButton
              title='Continuar depois'
              type='Secondary'
              width={150}
              handlePress={() => {
                router.push('ideas');
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
