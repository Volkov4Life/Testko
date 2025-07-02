import React from 'react';
import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

interface NaslovProps{
    text: string;
}



const Naslov = (props: NaslovProps) => {

    return(
        <SafeAreaView style={{ flex: 1 }}>
            <Text style={styles.text}>{props.text}</Text>
        </SafeAreaView>
        
    )
}

const styles = StyleSheet.create({
text: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },

});



export default Naslov;