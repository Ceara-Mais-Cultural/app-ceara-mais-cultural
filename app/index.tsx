import { ScrollView, View, Image, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, images } from '../constants';
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import CustomText from '@/components/CustomText';
import Container from '@/components/Container';

export default function Index() {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          Bahiana: require('../assets/fonts/Bahiana/Bahiana-Regular.ttf'),
          Poppins: require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
          PoppinsBold: require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
        });
        setFontLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar fontes:', error);
      }
    };

    loadFonts();
  }, []);

  if (!fontLoaded) {
    return <Text>Carregando fontes...</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.background}>
        <Container style={styles.content}>
          <Image source={images.logo} style={styles.logo} resizeMode='contain' />
          <CustomText style={styles.sloganText}>
            Onde a <CustomText style={styles.sloganHighlight}>arte</CustomText> encontra <CustomText style={styles.sloganHighlight}>oportunidade</CustomText>
          </CustomText>

          <View style={styles.listPromoters}>
            <CustomText style={styles.listText}>Esse é um projeto apoiado e patrocinado por:</CustomText>

            <View style={styles.promoterRow}>
              <View style={styles.promoter}>
                <Image source={images.logo} style={styles.promoterIcon} resizeMode='contain' />
                <CustomText style={styles.promoterText}>Fulano</CustomText>
              </View>
              <View style={styles.promoter}>
                <Image source={images.logo} style={styles.promoterIcon} resizeMode='contain' />
                <CustomText style={styles.promoterText}>Ciclano</CustomText>
              </View>
            </View>

            <View style={styles.promoterRow}>
              <View style={styles.promoter}>
                <Image source={images.logo} style={styles.promoterIcon} resizeMode='contain' />
                <CustomText style={styles.promoterText}>Deltrano</CustomText>
              </View>
              <View style={styles.promoter}>
                <Image source={images.logo} style={styles.promoterIcon} resizeMode='contain' />
                <CustomText style={styles.promoterText}>Ministério da Fazenda</CustomText>
              </View>
            </View>
          </View>

          <CustomText style={styles.calling}>Seja parte da revolução cultural do Ceará!</CustomText>
          <CustomButton title='Participar' type='Primary' height={60} width={250} handlePress={() => router.push('/sign-in')} />
        </Container>
      </ScrollView>

      <StatusBar backgroundColor={colors.background_light} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background_light,
  },

  content: {
    paddingHorizontal: 25,
    display: 'flex',
    alignItems: 'center',
  },

  logo: {
    height: 160,
    width: 160,
  },

  sloganText: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 25,
    marginTop: 20,
    width: 250,
  },

  sloganHighlight: {
    fontFamily: 'Bahiana',
    fontSize: 35,
    color: colors.primary,
  },

  listText: {
    color: colors.text,
    marginBottom: 15,
  },

  listPromoters: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },

  promoterRow: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 5,
  },

  promoter: {
    display: 'flex',
    minWidth: 160,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.off_white,
    borderRadius: 15,
  },

  promoterIcon: {
    width: 90,
    height: 90,
  },

  promoterText: {
    textAlign: 'center',
    maxWidth: 140,
    color: colors.text,
  },

  calling: {
    marginTop: 20,
    marginBottom: 20,
    color: colors.text,
  },
});
