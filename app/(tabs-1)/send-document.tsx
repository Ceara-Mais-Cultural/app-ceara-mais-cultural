import { ScrollView, View, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants';
import CustomButton from '@/components/CustomButton';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import CustomText from '@/components/CustomText';
import * as Sharing from 'expo-sharing';

const SendDocument = () => {
  const [isLoading, setIsLoading] = useState(false);

  const uploadDocument = async () => {
    setIsLoading(true);
    try {
      const pickedFile = await DocumentPicker.getDocumentAsync();
      const file = pickedFile.assets;
      if (!file) return;
      // Mandar pro Back
      setTimeout(() => {
        setIsLoading(false);
        // Abrir modal de confirmação
        router.replace('ideas');
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
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
        alert('O compartilhamento não está disponível na plataforma atual.');
      }
    } catch (error) {
      console.error('Erro ao baixar ou compartilhar o arquivo:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.background}>
        <View style={styles.card}>
          <CustomText style={styles.title}>Enviar Documento</CustomText>
          <CustomText style={styles.text}>Após preencher o documento de abertura de projeto que foi baixado no seu celular, envie-o aqui. Não se preocupe, você poderá voltar para essa tela mais tarde.</CustomText>
          <View style={styles.buttonArea}>
            <CustomButton title='Baixar modelo' width={150} type='Secondary' handlePress={async () => downloadAndShareFile()} />
          </View>
          <View style={styles.buttonArea}>
            <CustomButton title='Enviar documento' type='Primary' isLoading={isLoading} handlePress={async () => uploadDocument()} />
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
