import { ScrollView, Text, View, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '@/components/FormField';
import { colors } from '@/constants';
import CustomText from '@/components/CustomText';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const [user, setUser] = useState({
    full_name: '',
    cpf: '',
    email: '',
    city_name: '',
    neighborhood_name: '',
    community: '',
  });

  useEffect(() => {
    AsyncStorage.getItem('userData').then((userData: any) => {
      setUser(JSON.parse(userData));
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.background}>
        <View style={styles.card}>
          <CustomText style={styles.title}>Minha Conta</CustomText>

          <FormField title='Nome' disabled='true' value={user.full_name} handleChangeText={(e: any) => setUser({ ...user, full_name: e })} />
          <FormField title='CPF/CNPJ' disabled='true' value={user.cpf} handleChangeText={(e: any) => setUser({ ...user, cpf: e })} />
          <FormField title='E-mail' disabled='true' value={user.email} keyboardType='email-address' handleChangeText={(e: any) => setUser({ ...user, email: e })} />
          <FormField title='Município' disabled='true' value={user.city_name} handleChangeText={(e: any) => setUser({ ...user, city_name: e })} />
          <FormField title='Bairro' disabled='true' value={user.neighborhood_name} handleChangeText={(e: any) => setUser({ ...user, neighborhood_name: e })} />
          <FormField title='Comunidade' disabled='true' value={user.community} handleChangeText={(e: any) => setUser({ ...user, community: e })} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

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
});
