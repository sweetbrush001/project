import { StyleSheet } from 'react-native';

export const COLORS = {
  // Primary colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#1A3A6E', // Main primary color
    600: '#1565C0',
    700: '#0D47A1',
    800: '#0A3884',
    900: '#062C67',
  },
  // Secondary - Green
  secondary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main secondary color
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  // Accent - Orange (for highlights, buttons, etc.)
  accent: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#F57C00', // Main accent color
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },
  // Success - Green
  success: {
    50: '#E0F2F1',
    100: '#B2DFDB',
    200: '#80CBC4',
    300: '#4DB6AC',
    400: '#26A69A',
    500: '#009688',
    600: '#00897B',
    700: '#00796B',
    800: '#00695C',
    900: '#004D40',
  },
  // Warning - Amber
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107',
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  // Error - Red
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  // Neutral - Gray
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const FONT = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  bold: 'Inter-Bold',
};

export const SIZES = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
  xxxl: 80,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: COLORS.neutral[800],
    marginVertical: SIZES.m,
  },
  subtitle: {
    fontFamily: FONT.medium,
    fontSize: 18,
    color: COLORS.neutral[700],
    marginVertical: SIZES.s,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.neutral[700],
    lineHeight: 24,
  },
  caption: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary[500],
    borderRadius: SIZES.s,
    paddingVertical: SIZES.m,
    paddingHorizontal: SIZES.l,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.s,
    borderWidth: 1,
    borderColor: COLORS.primary[500],
    paddingVertical: SIZES.m,
    paddingHorizontal: SIZES.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: COLORS.white,
  },
  buttonTextSecondary: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: COLORS.primary[500],
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.m,
    padding: SIZES.m,
    marginVertical: SIZES.s,
    ...SHADOWS.small,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: SIZES.s,
    paddingHorizontal: SIZES.m,
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.neutral[800],
  },
  error: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.error[500],
    marginTop: SIZES.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: SIZES.m,
  },
});