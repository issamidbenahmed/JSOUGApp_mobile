import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateRole } from '../services/api';

const RoleChoiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };

  const handleRoleChange = async (role: 'eleve' | 'moniteur') => {
    const res = await updateRole(userId, role);
    if (res.success) {
      navigation.navigate('LoginScreen');
    } else {
      Alert.alert('Erreur', res.error || 'Erreur lors de la mise à jour du rôle');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisissez votre rôle</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleRoleChange('moniteur')}>
        <Text style={styles.buttonText}>Devenir un moniteur</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleRoleChange('eleve')}>
        <Text style={styles.buttonText}>Je suis un élève, Continuer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#222',
    textAlign: 'center',
  },
  button: {
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFB800',
    marginBottom: 18,
    width: '100%',
    minWidth: 260,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default RoleChoiceScreen; 