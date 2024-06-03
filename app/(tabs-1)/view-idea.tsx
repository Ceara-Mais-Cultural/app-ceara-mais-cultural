import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Pressable } from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, icons } from '@/constants';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import CustomText from '@/components/CustomText';
import { useFocusEffect } from '@react-navigation/native';
import AuthService from '../services/authService';

const ViewIdea = () => {
  const { idea } = useLocalSearchParams();
  const parsedIdea = JSON.parse(idea);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');

  useFocusEffect(
    useCallback(() => {
      AuthService.getUserData().then((userData: any) => {
        const user = JSON.parse(userData);
        setUser(user);
        const role = AuthService.getPermissionLevel(user);
        setRole(role);
      });
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/ideas')}>
          <Image style={styles.arrowBack} source={icons.arrowBack} resizeMode='contain' tintColor={colors.white} />
        </Pressable>
        <CustomText style={styles.title}>{parsedIdea?.title}</CustomText>
        <CustomText>{'          '}</CustomText>
      </View>
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
            <CustomText style={styles.textField}>{parsedIdea?.description}</CustomText>
          </View>

          {/* 2 Colunas */}
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Coluna Esquerda */}
            <View>
              {/* Município */}
              <View style={styles.fieldArea}>
                <CustomText style={styles.label}>Município</CustomText>
                <CustomText style={styles.textField}>{parsedIdea?.city_name}</CustomText>
              </View>
              {/* Comunidade */}
              <View style={styles.fieldArea}>
                <CustomText style={styles.label}>Comunidade</CustomText>
                <CustomText style={styles.textField}>{parsedIdea?.community}</CustomText>
              </View>
            </View>

            {/* Coluna Direita */}
            <View>
              {/* Bairro */}
              <View style={styles.fieldArea}>
                <CustomText style={styles.label}>Bairro</CustomText>
                <CustomText style={styles.textField}>{parsedIdea?.neighborhood_name}</CustomText>
              </View>
              {/* Categoria */}
              <View style={styles.fieldArea}>
                <CustomText style={styles.label}>Categoria</CustomText>
                <CustomText style={styles.textField}>{parsedIdea?.category_name}</CustomText>
              </View>
            </View>
          </View>

          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Local */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>Local</CustomText>
              <CustomText style={styles.textField}>{parsedIdea?.location}</CustomText>
            </View>

            {/* Data de Submissão */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>Data</CustomText>
              <CustomText style={styles.textField}>{parsedIdea?.created_at}</CustomText>
            </View>
          </View>

          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Agente Cultural */}
            {role !== 'Mobilizador' && (
              <View style={styles.fieldArea}>
                <CustomText style={styles.label}>Agente Cultural</CustomText>
                <CustomText style={styles.textField}>{parsedIdea?.author_name}</CustomText>
              </View>
            )}

            {/* Mobilizador */}
            <View style={styles.fieldArea}>
              <CustomText style={styles.label}>Mobilizador</CustomText>
              <CustomText style={styles.textField}>{parsedIdea?.promoter_name}</CustomText>
            </View>
          </View>

          {/* Documentos */}
          <View style={styles.fieldArea}>
            <CustomText style={styles.label}>Documentos</CustomText>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <CustomText style={styles.textField}>Termo de Abertura</CustomText>
              <TouchableOpacity style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', borderRadius: 5, borderWidth: 1, borderColor: colors.menu_secundary, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.white }}>
                <CustomText style={{ color: colors.menu_secundary }}>Download</CustomText>
                <Image style={{ width: 20, height: 20, marginLeft: 10 }} source={icons.download} tintColor={colors.menu_secundary} resizeMode='contain' />
              </TouchableOpacity>
            </View>
          </View>
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

  textField: {},
});
