import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export default function WaitForValidationScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon name="arrow-left" size={28} color="#222" />
      </TouchableOpacity>
      <Image source={require('../../assets/clock.jpg')} style={styles.icon} />
      <Text style={styles.title}>En attente de validation</Text>
      <Text style={styles.subtitle}>
        Vos informations sont en cours de vérification par l'administrateur.{"\n"}
        Vous recevrez une notification dès que votre compte sera validé.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  backButton: { position: 'absolute', top: 32, left: 16, zIndex: 2 },
  icon: { width: 80, height: 80, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center' },
}); 