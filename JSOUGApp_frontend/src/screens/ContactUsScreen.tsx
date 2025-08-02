import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ContactUsScreen({ navigation }: any) {
  const handleEmail = () => {
    Linking.openURL('mailto:support@jsoug.com').catch(() =>
      Alert.alert('Erreur', "Impossible d'ouvrir l'application de messagerie.")
    );
  };

  const handlePhone = () => {
    Linking.openURL('tel:+212600000000').catch(() =>
      Alert.alert('Erreur', "Impossible d'ouvrir l'application téléphonique.")
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon name="arrow-left" size={28} color="#222" />
      </TouchableOpacity>
      <Text style={styles.title}>Contactez-nous</Text>
      <Text style={styles.desc}>Vous pouvez nous contacter par :</Text>
      <TouchableOpacity style={styles.item} onPress={handleEmail}>
        <Icon name="email-outline" size={24} color="#FFA800" style={{ marginRight: 14 }} />
        <Text style={styles.itemText}>support@jsoug.com</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={handlePhone}>
        <Icon name="phone-outline" size={24} color="#FFA800" style={{ marginRight: 14 }} />
        <Text style={styles.itemText}>+212 6 00 00 00 00</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 48,
  },
  backButton: {
    position: 'absolute',
    top: 28,
    left: 16,
    zIndex: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
    marginLeft: 32,
    marginTop: 10,
  },
  desc: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
    marginLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },
  itemText: {
    fontSize: 16,
    color: '#222',
  },
});
