// components/SchoolCard.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface SchoolCardProps {
  title: string;
  onPress: () => void;
}

const SchoolCard = ({ title, onPress }: SchoolCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#007BFF',
    padding: 16,
    margin: 8,
    borderRadius: 10,
    backgroundColor: '#ffffff20',
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SchoolCard;
