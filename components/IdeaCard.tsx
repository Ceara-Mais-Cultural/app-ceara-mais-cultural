import { colors, icons } from '@/constants';
import { TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import CustomText from './CustomText';

const IdeaCard = ({ idea, onPress }: any) => {
  if (!idea || typeof idea !== 'object' || Object.keys(idea).length === 0) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.ideaCard} onPress={onPress}>
      <View style={[styles.statusBall, idea?.status === 'approved' ? { backgroundColor: colors.confirm } : idea?.status === 'pending' ? { backgroundColor: colors.pending } : { backgroundColor: colors.danger }]} />
      <View style={[styles.cardContent]}>
        <CustomText style={{ fontSize: 15 }}>{idea?.title}</CustomText>
        <CustomText style={{ fontSize: 12 }}>
          {idea?.category_name} - {idea?.city_name}
        </CustomText>
        <CustomText style={{ fontSize: 12 }}>Submetido em: {idea?.created_at}</CustomText>
      </View>

      <View style={{ marginRight: 10, width: 15, top: 5 }}>{idea?.status == 'waiting' && <CustomText style={{ color: colors.danger, fontSize: 24, marginTop: 7 }}>*</CustomText>}</View>

      <View>
        <Image style={{ width: 25, height: 25 }} source={icons.chevronForward} resizeMode='contain' tintColor={colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    width: '100%',
    maxWidth: 290,
  },

  ideaCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.stroke,
  },

  statusBall: {
    borderRadius: 50,
    width: 15,
    height: 15,
    marginRight: 15,
  },

  cardContent: {
    maxWidth: 210,
    width: '100%',
    marginRight: 15,
  },
});

export default IdeaCard;
