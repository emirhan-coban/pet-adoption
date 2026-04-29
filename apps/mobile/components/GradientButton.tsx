import { TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from 'react-native'
import { Colors, Fonts, BorderRadius } from '@/constants/theme'

interface GradientButtonProps {
  label: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  style?: object
}

export default function GradientButton({ label, onPress, disabled, style }: GradientButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.wrapper, disabled && { opacity: 0.6 }, style]}
    >
      <LinearGradient
        colors={[Colors.orange700, Colors.orange400]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    shadowColor: Colors.orange700,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontFamily: Fonts.headline,
    color: '#fff',
    letterSpacing: -0.3,
  },
})
