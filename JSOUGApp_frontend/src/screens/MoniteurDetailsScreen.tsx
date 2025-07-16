import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LICENSE_TYPES = [
  { type: 'A', icon: 'motorbike', label: 'Moto' },
  { type: 'B', icon: 'car-outline', label: 'Voiture' },
  { type: 'C', icon: 'truck-outline', label: 'Camion' },
  { type: 'D', icon: 'bus', label: 'Bus' },
  { type: 'E', icon: 'truck-trailer', label: 'Remorque' },
  { type: 'F', icon: 'tractor', label: 'Tracteur' },
  { type: 'G', icon: 'dump-truck', label: 'Chantier' },
  { type: 'H', icon: 'car-electric', label: 'Quad' },
];

export default function MoniteurDetailsScreen({ route, navigation }: any) {
  const { poste } = route.params;
  const moniteur = poste.moniteur;
  const carPhotos = Array.isArray(poste.cars) ? poste.cars.flatMap((car: any) => car.photos.map((p: any) => p.photo_url || p)).filter(Boolean) : [];
  const locations = poste.location ? [poste.location] : [];
  const certificates = Array.isArray(poste.certificates) ? poste.certificates.map((c: any) => c.photo_url) : [];

  console.log('POSTE:', poste);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer && navigation.openDrawer()} style={styles.iconButton}>
          <Icon name="menu" size={28} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="bell-outline" size={26} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Avatar, nom, note */}
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Image
          source={moniteur.avatar ? { uri: 'http://localhost:5000' + moniteur.avatar } : require('../assets/jsoug-logo.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{moniteur.fullName}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Icon name="star" size={16} color="#FFB800" />
          <Text style={{ marginLeft: 4, color: '#222', fontWeight: 'bold' }}>4,5</Text>
        </View>
      </View>
      {/* Prix, badges permis, boutons */}
      <View style={styles.rowCenter}>
        <Text style={styles.price}>{poste.price} DHS/h</Text>
        <View style={{ flexDirection: 'row', marginLeft: 12 }}>
          {poste.licenses && poste.licenses.map((type: string, idx: number) => {
            const found = LICENSE_TYPES.find(t => t.type === type);
            return (
              <View key={idx} style={[styles.badge, styles.badgeYellowBorder]}>
                <Icon name={found ? found.icon : 'card-account-details-outline'} size={18} color="#222" />
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.messageBtn]}
          onPress={async () => {
            const token = await AsyncStorage.getItem('userToken');
            try {
              const res = await fetch('http://localhost:5000/api/moniteur/messages/start', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ user2_id: moniteur.id }),
              });
              const data = await res.json();
              if (res.status === 200 && data.id) {
                navigation.navigate('ChatScreen', { conversationId: data.id });
              }
            } catch (err) {}
          }}
        >
          <Text style={styles.messageBtnText}>Envoyer un message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.reserveBtn]}
          onPress={() => navigation.navigate('BookingScreen', { moniteurId: moniteur.id, posteId: poste.id || poste.poste_id })}
        >
          <Text style={styles.reserveBtnText}>Réserver</Text>
        </TouchableOpacity>
      </View>
      {/* Biographie */}
      <Text style={styles.sectionTitle}>Biographie</Text>
      <Text style={styles.bioText}>{moniteur.description || 'Aucune biographie.'}</Text>
      {/* Photos de voiture */}
      <Text style={styles.sectionTitle}>Photos de voiture</Text>
      <FlatList
        data={carPhotos}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <Image
            source={{ uri: item.startsWith('http') ? item : 'http://localhost:5000' + item }}
            style={[
              styles.carPhoto,
              { marginLeft: index === 0 ? 12 : 0 }
            ]}
          />
        )}
        style={{ marginBottom: 8, paddingHorizontal: 4 }}
      />
      {/* Location */}
      <Text style={styles.sectionTitle}>Location</Text>
      <View style={styles.locationBox}>
        {locations.map((loc, idx) => (
          <View key={idx} style={styles.locationRow}>
            <Icon name="map-marker-outline" size={18} color="#7ED957" />
            <Text style={styles.locationText}>{loc}</Text>
          </View>
        ))}
      </View>
      {/* Certificats */}
      <Text style={styles.sectionTitle}>Certificates</Text>
      <FlatList
        data={certificates}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <Image
            source={{ uri: item.startsWith('http') ? item : 'http://localhost:5000' + item }}
            style={[
              styles.certificateImg,
              { marginLeft: index === 0 ? 12 : 0 }
            ]}
          />
        )}
        style={{ marginBottom: 8, paddingHorizontal: 4 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    paddingTop: 32,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  iconButton: {
    padding: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#222',
    marginTop: 8,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  price: {
    color: '#7ED957',
    fontWeight: 'bold',
    fontSize: 22,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeYellowBorder: {
    borderWidth: 2,
    borderColor: '#FFD600',
  },
  actionBtn: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFB800',
    fontWeight: 'bold',
    fontSize: 15,
  },
  reserveBtn: {
    backgroundColor: '#FFB800',
    borderWidth: 0,
  },
  reserveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 8,
  },
  bioText: {
    color: '#444',
    fontSize: 15,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  carPhoto: {
    width: 180,
    height: 100,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  locationBox: {
    backgroundColor: '#F6F6F6',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    color: '#222',
    fontSize: 15,
    marginLeft: 8,
  },
  certificateImg: {
    width: 160,
    height: 110,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
    gap: 0,
    paddingHorizontal: 12,
  },
  messageBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFB800',
  },
  messageBtnText: {
    color: '#FFB800',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 