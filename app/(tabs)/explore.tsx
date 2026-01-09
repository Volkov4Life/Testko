import { Platform, StyleSheet, View, Text } from 'react-native';

import AnimatedBackground from '@/components/AnimatedBackground';
import AppButton from '@/components/AppButton';
import ProfileButton from '@/components/ProfileButton';
import { router, Router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Naslov from '@/components/Naslov';
import BackButton from '@/components/BackButton';


export default function TabTwoScreen() {
  return (
    <AnimatedBackground>
      <SafeAreaView>
        
        <Naslov/>
        
          <AppButton text="Srednje šole" onPress={() => router.push("/SchoolSelectScreen")}/>
          <ProfileButton onPress={() => router.push("/LikedTestsScreen")}/>

      </SafeAreaView>
    </AnimatedBackground>
  );
}


