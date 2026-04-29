import React from 'react'
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const TABS: { name: string; icon: IoniconName; iconActive: IoniconName; label: string }[] = [
  { name: 'index',        icon: 'compass-outline',      iconActive: 'compass',      label: 'Keşfet'   },
  { name: 'mesajlar',     icon: 'chatbubble-outline',   iconActive: 'chatbubble',   label: 'Mesajlar' },
  { name: 'ilan-olustur', icon: 'add-circle-outline',   iconActive: 'add-circle',   label: 'İlan Ver' },
  { name: 'profil',       icon: 'person-outline',       iconActive: 'person',       label: 'Profil'   },
]

interface Props {
  state: any
  descriptors: any
  navigation: any
}

export default function CustomTabBar({ state, descriptors, navigation }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route: any, index: number) => {
        const tab = TABS[index]
        if (!tab) return null
        const focused = state.index === index

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={24}
                color={focused ? Colors.orange700 : Colors.onSurfaceVariant + '77'}
              />
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 14,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWrap: {
    width: 48,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#ffedd5',
  },
})
