import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import icons from '../../constants/icons';
import { colors } from '../../constants';
import AuthService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomText from '@/components/CustomText';

const TabIcon = ({ icon, color, name, focused }: any) => {
  return (
    <View style={styles.tabArea}>
      <Image source={icon} resizeMode='contain' tintColor={color} style={styles.tabIcon} />
      <CustomText style={focused ? styles.currentTab : null}>{name}</CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  tabArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIcon: {
    height: 25,
  },
  currentTab: {
    fontFamily: 'PoppinsBold',
    color: colors.primary,
  },
});

const TabsLayout = () => {
  const [role, setRole] = useState('Agente Cultural');

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const userRole = AuthService.getPermissionLevel(user);
        setRole(userRole);
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.menu_secundary,
          tabBarStyle: {
            backgroundColor: colors.off_white,
            marginTop: -80,
            paddingTop: 5,
            borderTopRightRadius: 15,
            borderTopLeftRadius: 15,
            height: 80,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
              },
              android: {
                elevation: 10,
              },
              web: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
              },
            }),
          },
        }}
      >
        <Tabs.Screen
          name='profile'
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => <TabIcon icon={icons.profile} color={color} name='Perfil' focused={focused} />,
          }}
        />

        <Tabs.Screen
          name='ideas'
          options={{
            title: 'Idéias',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => <TabIcon icon={icons.home} color={color} name='Ideias' focused={focused} />,
          }}
        />

        {role !== 'Agente Cultural' ? (
          <Tabs.Screen
            name='reports'
            options={{
              title: 'Relatório',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => <TabIcon icon={icons.reports} color={color} name='Relatório' focused={focused} />,
            }}
          />
        ) : (
          <Tabs.Screen
            name='reports'
            options={{
              title: 'Relatório',
              headerShown: false,
              tabBarButton: () => null,
            }}
          />
        )}

        {role !== 'Comissão' ? (
          <Tabs.Screen
            name='create'
            options={{
              title: 'Create',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => <TabIcon icon={icons.plus} color={color} name='Novo' focused={focused} />,
            }}
          />
        ) : (
          <Tabs.Screen
            name='create'
            options={{
              title: 'Create',
              headerShown: false,
              tabBarButton: () => null,
            }}
          />
        )}

        <Tabs.Screen name='view-idea' options={{ headerShown: false, tabBarButton: () => null }} />
        <Tabs.Screen name='pre-register' options={{ headerShown: false, tabBarButton: () => null }} />
        <Tabs.Screen name='send-document' options={{ headerShown: false, tabBarButton: () => null }} />
      </Tabs>
    </>
  );
};

export default TabsLayout;
