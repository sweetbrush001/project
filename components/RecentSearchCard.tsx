import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Clock, ChevronRight } from 'lucide-react-native';
import { COLORS, FONT, SIZES, SHADOWS } from '../constants/theme';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  Easing
} from 'react-native-reanimated';

interface RecentSearchProps {
  from: string;
  to: string;
  date?: string;
  onPress: () => void;
}

const RecentSearchCard = ({
  from,
  to,
  date,
  onPress,
}: RecentSearchProps) => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const handlePress = () => {
    // Quick animation on press
    scale.value = withTiming(0.98, { 
      duration: 100,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
    
    setTimeout(() => {
      scale.value = withTiming(1, { 
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      });
      onPress();
    }, 100);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }]
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity 
        style={styles.cardContent} 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Clock size={20} color={COLORS.primary[400]} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.routeText}>
            {from} <Text style={styles.arrowText}>→</Text> {to}
          </Text>
          {date && <Text style={styles.dateText}>{date}</Text>}
        </View>
        
        <ChevronRight size={20} color={COLORS.neutral[400]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.s,
    marginVertical: SIZES.xs,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.m,
  },
  iconContainer: {
    backgroundColor: COLORS.primary[50],
    borderRadius: SIZES.s,
    padding: SIZES.s,
    marginRight: SIZES.m,
  },
  textContainer: {
    flex: 1,
  },
  routeText: {
    fontFamily: FONT.medium,
    fontSize: 15,
    color: COLORS.neutral[800],
  },
  arrowText: {
    color: COLORS.primary[500],
  },
  dateText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
});

export default RecentSearchCard;