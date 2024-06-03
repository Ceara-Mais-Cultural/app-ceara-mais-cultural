import { ScrollView, Text, View, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '@/components/FormField';
import { colors } from '@/constants';
import CustomText from '@/components/CustomText';

const Reports = () => {
  useEffect(() => {
    setForm({
      nome: 'Luís Guilherme Gaboardi Lins',
      cpfCnpj: '027.080.951-10',
      email: 'luis.ggaboardi@gmail.com',
      municipio: 'Fortaleza',
      bairro: 'Rio João',
      comunidade: 'Flamengos',
    });
  }, []);

  const [form, setForm] = useState({
    nome: '',
    cpfCnpj: '',
    email: '',
    municipio: '',
    bairro: '',
    comunidade: '',
  });

  return (
    <SafeAreaView>
      <ScrollView style={styles.background}>
        <CustomText style={styles.title}>Relatório</CustomText>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Reports;

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background_dark,
  },

  title: {
    fontFamily: 'PoppinsBold',
    color: colors.white,
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 30,
  },
});
