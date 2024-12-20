import { ScrollView, View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, images } from "../constants";
import { useEffect, useState } from "react";
import * as Font from "expo-font";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomText from "@/components/CustomText";
import Container from "@/components/Container";

export default function Index() {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          Bahiana: require("../assets/fonts/Bahiana/Bahiana-Regular.ttf"),
          Poppins: require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
          PoppinsBold: require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
        });
        setFontLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar fontes:", error);
      }
    };

    loadFonts();
  }, []);

  if (!fontLoaded) {
    return (
      <View style={{ marginHorizontal: "auto", marginTop: 200 }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={[styles.background]} persistentScrollbar={true}>
        <Container style={styles.content}>
          <Image source={images.logo as any} style={styles.logo} resizeMode="contain" />
          <CustomText style={styles.sloganText}>
            Onde a <CustomText style={styles.sloganHighlight}>cultura</CustomText> encontra <CustomText style={styles.sloganHighlight}>oportunidade</CustomText>
          </CustomText>

          <View style={styles.listPromoters}>
            <CustomText style={styles.listText}>Esse é um projeto apoiado e patrocinado por:</CustomText>

            <View style={styles.promoterRow}>
              <Image source={images.mjssp as any} style={{ marginTop: 10, width: "89.8%", height: 290, borderWidth: 1.5, borderColor: colors.stroke, borderRadius: 15 }} resizeMode="contain" />
            </View>

            <View style={styles.promoterRow}>
              <View style={styles.promoter}>
                <Image source={images.aspra as any} style={styles.promoterIcon} resizeMode="contain" />
                <CustomText style={styles.promoterText}>ASPRA</CustomText>
              </View>
              <View style={styles.promoter}>
                <Image source={images.impactHub as any} style={[styles.promoterIcon, { width: 140 }]} resizeMode="contain" />
                <CustomText style={styles.promoterText}>IMPACT HUB</CustomText>
              </View>
            </View>

            <View style={styles.promoterRow}>
              <View style={styles.promoter}>
                <Image source={images.pronasci as any} style={[styles.promoterIcon, { width: 120 }]} resizeMode="contain" />
                <CustomText style={styles.promoterText}>PRONASCI</CustomText>
              </View>
              <View style={styles.promoter}>
                <Image source={images.ufc as any} style={[styles.promoterIcon, { width: 120 }]} resizeMode="contain" />
                <CustomText style={styles.promoterText}>UFC</CustomText>
              </View>
            </View>
          </View>

          <CustomText style={{ marginVertical: 10, textAlign: "center" }}>Seja parte da revolução cultural do Ceará!</CustomText>
          <CustomButton title="Participar" type="Primary" height={60} width={250} handlePress={() => router.push("/sign-in")} />

          <CustomText style={{ marginTop: 10 }}>Versão 1.0.3</CustomText>
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
    display: "flex",
    alignItems: "center",
    rowGap: 10,
    paddingBottom: 20,
  },

  logo: {
    height: 160,
    width: 160,
    marginVertical: -15,
  },

  sloganText: {
    fontSize: 25,
    textAlign: "center",
    width: 250,
  },

  sloganHighlight: {
    fontFamily: "Bahiana",
    fontSize: 35,
    color: colors.primary,
  },

  listText: {
    marginBottom: 10,
    textAlign: "center",
  },

  listPromoters: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },

  promoterRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },

  promoter: {
    display: "flex",
    minWidth: 160,
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    borderWidth: 1.5,
    borderColor: colors.stroke,
    backgroundColor: colors.white,
    borderRadius: 15,
  },

  promoterIcon: {
    marginTop: 10,
    width: 90,
    height: 80,
  },

  promoterText: {
    textAlign: "center",
    maxWidth: 150,
  },
});
