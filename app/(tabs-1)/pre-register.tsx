import { ScrollView, View, StyleSheet, Image } from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, images } from '@/constants';
import CustomButton from '@/components/CustomButton';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import CustomText from '@/components/CustomText';
import Loader from '@/components/Loader';

const PreRegister = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState([] as any);
  const { idea } = useLocalSearchParams();
  const [parsedIdea, setParsedIdea] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const parsed = JSON.parse(idea as any);
      setParsedIdea(parsed);
    }, [idea])
  );

  const handleClick = async (download: boolean) => {
    if (download) {
      await downloadAndShareFile();
    }
    router.push({ pathname: '/send-document', params: { idea: JSON.stringify(parsedIdea) } });
  };

  const downloadAndShareFile = async () => {
    setLoading(true);
    setStatus([]);
    try {
      // URL do arquivo que você deseja baixar
      const fileUri = FileSystem.documentDirectory + 'Termo de Abertura do Projeto.docx';
      const assetUri = 'https://github.com/Ceara-Mais-Cultural/app-ceara-mais-cultural/raw/main/assets/termo-projeto.docx';

      // Baixar o arquivo
      await FileSystem.downloadAsync(assetUri, fileUri);

      // Compartilhar o arquivo se possível
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
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
          <CustomText style={styles.title}>Projeto Pré-Cadastrado</CustomText>
          <Image source={images.success} style={styles.image} />
          <CustomText style={styles.text}>O seu projeto deve ser detalhado, necessariamente, usando o Modelo disponível abaixo. Clique para baixar e, após o preenchimento, envie o documento preenchido e assinado na próxima tela.</CustomText>
          <View style={styles.buttonArea}>
            <CustomButton title='Baixar modelo de projeto' type='Secondary' handlePress={async () => handleClick(true)} />
            <CustomButton title='Continuar' type='Primary' handlePress={async () => handleClick(false)} />
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
    textAlign: 'justify'
  },

  buttonArea: {
    marginHorizontal: 'auto',
    rowGap: 25,
  },
});
