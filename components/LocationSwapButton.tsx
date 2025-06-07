import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { ArrowUpDown } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface LocationSwapButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

const LocationSwapButton = ({
  onPress,
  style,
}: LocationSwapButtonProps) => {
  const rotation = useSharedValue(0);
  
  const handlePress = () => {
    // Rotate animation
    rotation.value = withSequence(
      withTiming(rotation.value + 180, { 
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      }),
      withTiming(rotation.value + 360, { 
        duration: 0 
      })
    );
    
    onPress();
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }]
    };
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={animatedStyle}>
        <ArrowUpDown size={20} color={COLORS.primary[500]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.xl,
    padding: SIZES.s,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.primary[100],
    ...SHADOWS.small,
  },
});

export default LocationSwapButton;