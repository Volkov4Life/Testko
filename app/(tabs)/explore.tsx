import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  return (
    <View>
      <Text style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>This is the Profile screen2</Text>
    </View>
  );
}


