// Design system - mirrors web globals.css color system exactly

export const Colors = {
  primary: '#904d00',
  primaryContainer: '#ff8c00',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#623200',

  secondary: '#77574d',
  secondaryContainer: '#fed3c7',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#795950',

  tertiary: '#00658f',
  tertiaryContainer: '#00b5fc',

  surface: '#f9f9f9',
  surfaceDim: '#dadada',
  surfaceBright: '#f9f9f9',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f3f3',
  surfaceContainer: '#eeeeee',
  surfaceContainerHigh: '#e8e8e8',
  surfaceContainerHighest: '#e2e2e2',
  surfaceVariant: '#e2e2e2',

  onSurface: '#1a1c1c',
  onSurfaceVariant: '#564334',
  onBackground: '#1a1c1c',
  background: '#f9f9f9',

  outline: '#897362',
  outlineVariant: '#ddc1ae',

  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  inverseSurface: '#2f3131',
  inverseOnSurface: '#f1f1f1',
  inversePrimary: '#ffb77d',

  primaryFixed: '#ffdcc3',
  primaryFixedDim: '#ffb77d',
  secondaryFixed: '#ffdbd0',

  // Gradient colors (btn-gradient)
  gradientStart: '#c2410c',
  gradientEnd: '#f97316',

  // Orange shades used across the app
  orange50: '#fff7ed',
  orange100: '#ffedd5',
  orange300: '#fdba74',
  orange400: '#fb923c',
  orange500: '#f97316',
  orange700: '#c2410c',
  orange800: '#9a3412',
  orange900: '#7c2d12',

  blue500: '#3b82f6',
  green100: '#dcfce7',
  green700: '#15803d',
  green800: '#166534',
}

export const Fonts = {
  headline: 'PlusJakartaSans_800ExtraBold',
  headlineBold: 'PlusJakartaSans_700Bold',
  headlineSemiBold: 'PlusJakartaSans_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodyBold: 'Inter_700Bold',
  bodySemiBold: 'Inter_600SemiBold',
}

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
}

export const Shadows = {
  editorial: {
    shadowColor: '#1a1c1c',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    shadowColor: '#1a1c1c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
}
