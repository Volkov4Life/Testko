import { View, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title="Go to Explore"
        onPress={() => router.push('/(tabs)/explore')}
      />
    </View>
  );
}
