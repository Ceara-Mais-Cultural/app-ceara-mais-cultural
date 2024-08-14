import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, icons } from '@/constants';
import CustomButton from '@/components/CustomButton';
import { router, useFocusEffect } from 'expo-router';
import AuthService from '../services/authService';
import CustomText from '@/components/CustomText';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stages = () => {
  const [cards, setCards] = useState([{ text: 'Submissão de ideias' }]);

  useEffect(() => {
    const fetchData = async () => {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        const role = AuthService.getPermissionLevel(user);
        if (role === 'Comissão') {
          setCards([{ text: 'Curadoria de ideias' }]);
        }
      }
    };

    fetchData();
  }, []);

  const logout = () => {
    router.replace('/sign-in');
  };

  const handleNavigation = (index: number) => {
    switch (index) {
      case 1:
        router.push('/ideas');
        break;

      case 2:
        router.push('/sign-in');
        break;

      case 3:
        router.push('/sign-in');
        break;

      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.header}>
          <CustomText style={styles.title}>Etapas do Programa</CustomText>
        </View>
        <View style={styles.content}>
          {cards.map((option: any, index: number) => (
            <TouchableOpacity key={index} style={styles.card} onPress={() => handleNavigation(index + 1)}>
              <CustomText style={styles.cardText} key={index}>
                {index + 1}. {option.text}
              </CustomText>
              <Image style={styles.chevron} source={icons.chevronForward} tintColor={colors.primary} resizeMode='contain' />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonArea}>
        <CustomButton title='Sair' type='Primary' handlePress={logout} />
      </View>
    </SafeAreaView>
  );
};

export default Stages;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background_light,
    display: 'flex',
    justifyContent: 'space-between',
  },

  header: {
    backgroundColor: colors.background_dark,
    height: 65,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },

  content: {
    margin: 15,
    gap: 15,
  },

  card: {
    backgroundColor: colors.off_white,
    paddingVertical: 30,
    paddingHorizontal: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderRadius: 25,
    borderColor: colors.stroke,
    borderWidth: 1,
  },

  cardText: {
    fontSize: 16,
    top: 3,
  },

  chevron: {
    width: 35,
    height: 35,
  },

  buttonArea: {
    marginBottom: 50,
    marginHorizontal: 'auto',
    rowGap: 35,
  },
});
