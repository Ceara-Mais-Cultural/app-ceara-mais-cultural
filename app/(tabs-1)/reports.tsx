import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants';
import DynamicTable from '@/components/DynamicTable';
import CustomButton from '@/components/CustomButton';
import CustomText from '@/components/CustomText';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import { useFocusEffect } from '@react-navigation/native';
import AuthService from '../services/authService';
import getDataService from '../services/getDataService';

const Reports = () => {
  const tableHeader = ['Identificador', 'Título', 'Descrição', 'Município', 'Bairro', 'Comunidade', 'Local', 'Categoria', 'Data de Submissão', 'Agente Cultural', 'Mobilizador', 'Status'];
  const [ideas, setIdeas] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AuthService.getUserData().then((userData: any) => {
        const user = JSON.parse(userData);
        const role = AuthService.getPermissionLevel(user);
        if (role === 'Comissão') setIsAdmin(true);
      });

      getIdeas();
    }, [])
  );

  const getIdeas = async (idUser: number | null = null, idCity: number | null = null) => {
    setIsLoading(true);

    try {
      const res = await getDataService.getProjects(idUser, idCity);
      const formattedIdeas = res.data
        .map((idea: any) => {
          return {
            ...idea,
            created_at: formatDate(idea.created_at),
            status: translateStatus(idea.status),
          };
        })
        .map(removeUnnecessaryKeys);

      setIdeas(formattedIdeas);
    } catch (error) {
      console.error('Erro ao buscar projetos: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const translateStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Em análise',
      waiting: 'Aguardando documentação',
      approved: 'Aprovada',
      declined: 'Recusada',
    };

    return statusMap[status];
  };

  const removeUnnecessaryKeys = (idea: any) => {
    const { author, category, city, neighborhood, promoter, image, file, ...rest } = idea;
    return rest;
  };

  const exportDataToExcel = async (data: any) => {
    try {
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '');
      const formattedTime = date.toTimeString().split(' ')[0].replace(/:/g, '');
      const filename = `projetos_${formattedDate}_${formattedTime}.xlsx`;

      let wb = XLSX.utils.book_new();
      let ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

      const uri = FileSystem.cacheDirectory + filename;

      // Convert the Uint8Array to base64
      const buffer = new Uint8Array(wbout.split('').map((c: any) => c.charCodeAt(0)));
      const b64 = buffer.reduce((data, byte) => data + String.fromCharCode(byte), '');
      const base64 = btoa(b64);

      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Erro', 'Compartilhamento não está disponível');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Compartilhar arquivo Excel',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar e compartilhar o arquivo Excel');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.title}>Relatório</CustomText>
        <View style={styles.buttonArea}>{isAdmin && <CustomButton title='Exportar Excel' type='Primary' width={160} height={50} isLoading={isLoading} handlePress={async () => exportDataToExcel(ideas)} />}</View>
      </View>
      <ScrollView style={styles.content}>
        <DynamicTable data={ideas} header={tableHeader} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Reports;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background_light,
    flex: 1,
    paddingBottom: 60,
  },

  header: {
    backgroundColor: colors.background_dark,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    padding: 20,
  },

  title: {
    color: colors.white,
    fontSize: 25,
    fontFamily: 'PoppinsBold',
    marginHorizontal: 'auto',
    marginBottom: 5,
  },

  buttonArea: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },

  content: {
    display: 'flex',
    marginBottom: 15,
  },
});
