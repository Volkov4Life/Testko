import React from 'react';
import { Text, StyleSheet, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

interface NaslovProps {
  text?: string;
}

const Naslov = ({ text = "TESTKO" }: NaslovProps) => {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  
  container: {
    alignItems: 'center', 
  },
  text: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
    marginTop: -250, 
    marginBottom: 300,
  },
});

export default Naslov;
