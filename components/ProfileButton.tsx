// components/ProfileButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileButtonProps {
  onPress: () => void;
  showIcon?: boolean;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ onPress, showIcon = true }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      {showIcon ? (
        <Ionicons name="person-circle-outline" size={32} color="#01579b" />
      ) : (
        <Text style={styles.text}>Profil</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#b3e5fc',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    margin: 8,
  },
  text: {
    color: '#01579b',
    fontWeight: '600',
  },
});

export default ProfileButton;
