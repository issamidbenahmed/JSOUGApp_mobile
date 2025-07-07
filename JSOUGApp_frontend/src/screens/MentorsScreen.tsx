import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MoniteursScreen({ navigation }: any) {
  const [moniteurs, setMoniteurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoniteurs = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/moniteur/all-postes');
        const data = await res.json();
        // Grouper par moniteur (un poste par moniteur, le plus récent)
        const byMoniteur: Record<string, any> = {};
        for (const poste of data) {
          if (!byMoniteur[poste.moniteur.id]) {
            byMoniteur[poste.moniteur.id] = poste;
          }
        }
        setMoniteurs(Object.values(byMoniteur));
      } catch (err) {
        Alert.alert('Erreur', 'Impossible de charger les moniteurs');
      }
      setLoading(false);
    };
    fetchMoniteurs();
  }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('MoniteurDetailsScreen', { moniteurId: item.moniteur.id, poste: item })}>
      <Image
        source={item.moniteur.avatar ? { uri: 'http://localhost:5000' + item.moniteur.avatar } : require('../assets/jsoug-logo.png')}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.moniteur.fullName}</Text>
        {item.location && <Text style={styles.location}>{item.location}</Text>}
      </View>
      <Icon name="chevron-right" size={28} color="#B0B0B0" />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Text style={styles.title}>Tous les moniteurs</Text>
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#FFB800" />
      ) : (
        <FlatList
          data={moniteurs}
          keyExtractor={item => item.moniteur.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 32,
    marginBottom: 16,
    marginLeft: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#222',
  },
  location: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
}); 