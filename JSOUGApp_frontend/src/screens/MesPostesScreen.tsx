import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Image, ToastAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MesPostesScreen({ navigation }: any) {
  const [postes, setPostes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cars, setCars] = useState<any[]>([]);

  const fetchPostes = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    try {
      const res = await fetch('http://localhost:5000/api/moniteur/postes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setPostes(data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les postes');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPostes();
    // Récupère toutes les voitures du moniteur
    const fetchCars = async () => {
      const token = await AsyncStorage.getItem('userToken');
      try {
        const res = await fetch('http://localhost:5000/api/moniteur/details', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCars(data.cars || []);
      } catch (err) {
        console.log('Erreur fetch cars', err);
      }
    };
    fetchCars();
  }, []);

  const handleDelete = async (posteId: number) => {
    console.log('Suppression poste', posteId);
    const token = await AsyncStorage.getItem('userToken');
    try {
      const res = await fetch(`http://localhost:5000/api/moniteur/postes/${posteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Status suppression', res.status);
      const data = await res.json();
      console.log('Réponse suppression', data);
      if (data.success || data.message) {
        setPostes(postes.filter(p => (p.id || p.poste_id) !== posteId));
        if (Platform.OS === 'android') {
          ToastAndroid.show('Poste supprimé', ToastAndroid.SHORT);
        } else {
          // Pour iOS, tu peux utiliser un autre composant de toast si besoin
          console.log('Poste supprimé');
        }
      } else {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Erreur lors de la suppression', ToastAndroid.SHORT);
        } else {
          console.log('Erreur lors de la suppression');
        }
      }
    } catch (err) {
      console.log('Erreur suppression', err);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Erreur lors de la suppression', ToastAndroid.SHORT);
      } else {
        console.log('Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4BB543" />;

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12, padding: 4 }}>
          <Icon name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes Postes</Text>
      </View>
      <FlatList
        data={postes}
        keyExtractor={item => item.id?.toString() || item.poste_id?.toString()}
        refreshing={refreshing}
        onRefresh={fetchPostes}
        renderItem={({ item }) => {
          console.log('POSTE', item);
          // Affiche la première image de la première voiture du moniteur
          let carImage = null;
          if (cars && cars.length > 0) {
            const firstCar = cars[0];
            if (firstCar.photos && firstCar.photos.length > 0) {
              const p = firstCar.photos[0];
              carImage = typeof p === 'string'
                ? (p.startsWith('http') ? p : `http://localhost:5000${p}`)
                : (p.photo_url ? (p.photo_url.startsWith('http') ? p.photo_url : `http://localhost:5000${p.photo_url}`) : null);
            }
          }
          return (
            <View style={[styles.posteBox, { flexDirection: 'row', alignItems: 'center' }]}> 
              {carImage && (
                <Image source={{ uri: carImage }} style={styles.carImage} />
              )}
              <View style={{ flex: 1, marginLeft: carImage ? 12 : 0 }}>
                <Text style={styles.posteDesc}>{item.description || item.poste_description}</Text>
                <Text style={styles.postePrice}>{item.price} DHS</Text>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id || item.poste_id)}>
                  <Icon name="delete" size={20} color="#fff" />
                  <Text style={styles.deleteBtnText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Aucun poste trouvé.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#222', textAlign: 'center' },
  posteBox: { backgroundColor: '#F9F9F9', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA' },
  posteDesc: { fontSize: 16, color: '#222', marginBottom: 8 },
  postePrice: { fontWeight: 'bold', color: '#4BB543', marginBottom: 8 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F44336', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-end' },
  deleteBtnText: { color: '#fff', marginLeft: 6, fontWeight: 'bold' },
  carImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
}); 