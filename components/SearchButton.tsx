import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Search } from 'lucide-react-native';
import { COLORS, FONT, SIZES, SHADOWS } from '../constants/theme';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence,
  withDelay
} from 'react-native-reanimated';

interface SearchButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const SearchButton = ({
  onPress,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}: SearchButtonProps) => {
  const scale = useSharedValue(1);
  
  const handlePress = () => {
    // Animate button press
    scale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 200 }),
      withDelay(100, withSpring(1, { damping: 15, stiffness: 150 }))
    );
    
    if (!disabled && !isLoading) {
      onPress();
    }
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  return (
    <Animated.View style={[animatedStyle, styles.buttonContainer]}>
      <TouchableOpacity
        style={[
          styles.button,
          disabled ? styles.buttonDisabled : null,
          style
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <>
            <Search size={20} color={COLORS.white} style={styles.icon} />
            <Text style={[styles.buttonText, textStyle]}>Search Routes</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    marginVertical: SIZES.m,
  },
  button: {
    backgroundColor: COLORS.primary[500],
    borderRadius: SIZES.s,
    paddingVertical: SIZES.m,
    paddingHorizontal: SIZES.l,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 55,
    ...SHADOWS.medium,
  },
  buttonDisabled: {
    backgroundColor: COLORS.neutral[400],
    ...SHADOWS.small,
  },
  icon: {
    marginRight: SIZES.s,
  },
  buttonText: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: COLORS.white,
  },
});

export default SearchButton;