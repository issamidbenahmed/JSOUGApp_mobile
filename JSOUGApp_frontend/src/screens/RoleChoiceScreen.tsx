import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateRole } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/clerk-expo';

const RoleChoiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { getToken } = useAuth();
  const { userId, isGoogleAuth } = route.params as { userId?: string; isGoogleAuth?: boolean };

  const handleRoleChange = async (role: 'eleve' | 'moniteur') => {
    try {
      if (isGoogleAuth) {
        // For Google auth users, we need to update their role in the database
        // and then redirect them to the main app
        const backendUrl = 'http://localhost:5000/api/google-auth/update-role';
        
        // Get the auth token from Clerk
        const authToken = await getToken();
        
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ role })
        });

        if (!response.ok) {
          throw new Error('Failed to update role');
        }

        const result = await response.json();
        if (result.success) {
          // Store the role locally
          await AsyncStorage.setItem('userRole', role);
          
          // Store the new JWT token if provided
          if (result.jwtToken) {
            await AsyncStorage.setItem('userToken', result.jwtToken);
            console.log('New JWT token stored after role update');
          }
          
          // Check if user is a moniteur and needs validation
          console.log('Role choice validation check:', {
            role: role,
            isvalidated: result.isvalidated,
            type: typeof result.isvalidated
          });
          
          // Convert isvalidated to number for comparison (handle both string and number types)
          const isvalidated = parseInt(result.isvalidated) || 0;
          
          if (role === 'moniteur' && isvalidated === 0) {
            console.log('Moniteur not validated, redirecting to validation screen');
            navigation.navigate('WaitForValidationScreen' as never);
          } else {
            console.log('User validated or not a moniteur, redirecting to profile');
            navigation.navigate('Profile' as never);
          }
        } else {
          throw new Error(result.error || 'Failed to update role');
        }
      } else {
        // For regular signup users, use the existing updateRole function
        if (!userId) {
          Alert.alert('Erreur', 'User ID manquant');
          return;
        }
        
        const res = await updateRole(userId, role);
        if (res.success) {
          navigation.navigate('LoginScreen' as never);
        } else {
          Alert.alert('Erreur', res.error || 'Erreur lors de la mise à jour du rôle');
        }
      }
    } catch (error) {
      console.error('Error updating role:', error);
      Alert.alert('Erreur', 'Erreur lors de la mise à jour du rôle');
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