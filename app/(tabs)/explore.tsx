import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AnimatedBackground from '@/components/AnimatedBackground';
import AppButton from '@/components/AppButton';
import ProfileButton from '@/components/ProfileButton';
import { router, Router } from 'expo-router';


export default function TabTwoScreen() {
  return (
    <AnimatedBackground>
      <View>
        <AppButton text="Srednje šole" onPress={() => router.push("/srednje")}/>
        <ProfileButton onPress={() => router.push("/profil")}/>
      </View>
    </AnimatedBackground>
  );
}


