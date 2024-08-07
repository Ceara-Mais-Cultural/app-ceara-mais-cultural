import { ScrollView, View, StyleSheet, Image, Alert } from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, images } from '@/constants';
import CustomButton from '@/components/CustomButton';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import CustomText from '@/components/CustomText';

const PreRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { idea } = useLocalSearchParams();
  const [parsedIdea, setParsedIdea] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const parsed = JSON.parse(idea as any);
      setParsedIdea(parsed);
    }, [idea])
  );

  const handleClick = async () => {
    setIsLoading(true);
    await downloadAndShareFile();
    setIsLoading(false);
    router.push({ pathname: 'send-document', params: { idea: JSON.stringify(parsedIdea) } });
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
      <ScrollView style={styles.background}>
        <View style={styles.card}>
          <CustomText style={styles.title}>Projeto Pré-Cadastrado</CustomText>
          <Image source={images.success} style={styles.image} />
          <CustomText style={styles.text}>Faça o download do termo de abertura do projeto com o botão abaixo para detalhar sua ideia com o nosso modelo.</CustomText>
          <View style={styles.buttonArea}>
            <CustomButton title='Baixar modelo de projeto' type='Primary' isLoading={isLoading} handlePress={async () => handleClick()} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PreRegister;

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
    marginBottom: 40,
  },

  image: {
    marginHorizontal: 'auto',
    width: 100,
    height: 100,
    marginBottom: 25,
  },

  text: {
    color: colors.text,
    marginBottom: 25,
  },

  buttonArea: {
    marginHorizontal: 'auto',
  },
});
