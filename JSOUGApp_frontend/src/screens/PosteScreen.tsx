import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView as RNScrollView } from 'react-native';

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

export default function PosteScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [posting, setPosting] = useState(false);
  const [cars, setCars] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [role, setRole] = React.useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfileAndDetails = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      try {
        // Récupère nom et avatar
        const profileRes = await fetch('http://localhost:5000/api/moniteur/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        setProfile(profileData);
        // Récupère détails (voitures, permis, etc.)
        const detailsRes = await fetch('http://localhost:5000/api/moniteur/details', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const detailsData = await detailsRes.json();
        setCars(detailsData.cars || []);
        setLicenses(detailsData.licenses || []);
      } catch (err) {
        Alert.alert('Erreur', 'Impossible de charger les infos moniteur');
      }
      setLoading(false);
    };
    fetchProfileAndDetails();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('userRole').then(setRole);
  }, []);

  const handlePost = async () => {
    if (!price || !description) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setPosting(true);
    const token = await AsyncStorage.getItem('userToken');
    try {
      const res = await fetch('http://localhost:5000/api/moniteur/postes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ price, description }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Succès', 'Poste créé avec succès');
        setPrice('');
        setDescription('');
      } else {
        Alert.alert('Erreur', data.error || 'Erreur lors de la création du poste');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur réseau');
    }
    setPosting(false);
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FFB800" />;
  }

  // Récupération des infos voiture, transmission, carburant, permis
  const car = profile?.cars?.[0];
  const carImage = car?.photos?.[0]?.photo_url || car?.photos?.[0] || null;
  const transmission = car?.transmission || 'N/A';
  const fuel = car?.fuel_type || 'N/A';
  const moniteurName = profile?.fullName || '';
  const avatar = profile?.avatar ? { uri: 'http://localhost:5000' + profile.avatar } : null;

  // Aplatir toutes les photos de toutes les voitures
  const allCarPhotos = cars.flatMap(car =>
    (car.photos || []).map(photo =>
      typeof photo === 'string'
        ? (photo.startsWith('http') ? photo : 'http://localhost:5000' + photo)
        : (photo.photo_url ? (photo.photo_url.startsWith('http') ? photo.photo_url : 'http://localhost:5000' + photo.photo_url) : null)
    )
  ).filter(Boolean);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer && navigation.openDrawer()} style={styles.iconButton}>
          <Icon name="menu" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer une offre/poste</Text>
        <TouchableOpacity onPress={() => Alert.alert('Notifications')} style={styles.iconButton}>
          <Icon name="bell-outline" size={26} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Aperçu de la carte du poste */}
      <View style={styles.card} onLayout={e => setCardWidth(e.nativeEvent.layout.width)}>
        <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {allCarPhotos.length > 0 ? allCarPhotos.map((photo: any, idx: number) => (
            <View
              key={idx}
              style={[
                styles.imageContainer,
                cardWidth ? { width: cardWidth * 0.92, alignSelf: 'center' } : { width: '92%', alignSelf: 'center' }
              ]}
            >
              <Image source={{ uri: photo }} style={styles.carImage} />
              {/* Badges en overlay sur l'image */}
              <View style={styles.overlayBadges}>
                <View style={[styles.badge, styles.badgeYellowBorder]}><Text style={styles.badgeText}>{cars[0]?.transmission || 'N/A'}</Text></View>
                <View style={[styles.badge, styles.badgeYellowBorder]}><Icon name={cars[0]?.fuel_type === 'essence' ? 'gas-station' : 'fuel'} size={18} color="#222" /></View>
                {licenses.map((l: any, idx2: number) => {
                  const found = LICENSE_TYPES.find(t => t.type === l.type);
                  return (
                    <View key={idx2} style={[styles.badge, styles.badgeYellowBorder]}>
                      <Icon name={found ? found.icon : 'card-account-details-outline'} size={18} color="#222" />
                    </View>
                  );
                })}
              </View>
            </View>
          )) : (
            <View style={[
              styles.imageContainer,
              { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
              cardWidth ? { width: cardWidth * 0.91, alignSelf: 'center' } : { width: '91%', alignSelf: 'center' }
            ]}>
              <Icon name="car" size={48} color="#bbb" />
            </View>
          )}
        </RNScrollView>
        {/* Le reste du contenu de la carte */}
        <Text style={styles.cardTitle}>{description || 'Contenu du poste...'}</Text>
        <View style={styles.cardFooter}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {avatar && <Image source={avatar} style={styles.avatar} />}
            <Text style={styles.moniteurName}>{moniteurName}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="star" size={18} color="#FFB800" />
            <Text style={{ marginLeft: 4, fontWeight: 'bold', color: '#222' }}>4,5</Text>
          </View>
        </View>
        <View style={styles.priceRow}>
          <Icon name="currency-usd" size={22} color="#7ED957" />
          <Text style={styles.priceText}>{price ? `${price} DHS/h` : 'Prix...'}</Text>
        </View>
      </View>

      {/* Formulaire */}
      <View style={styles.form}>
        <Text style={styles.label}>Prix (DHS/h)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="Ex: 500"
        />
        <Text style={styles.label}>Contenu du poste</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Décrivez votre offre..."
          multiline
        />
        <TouchableOpacity style={styles.postButton} onPress={handlePost} disabled={posting}>
          <Text style={styles.postButtonText}>{posting ? 'Publication...' : 'Poster'}</Text>
        </TouchableOpacity>
      </View>
      {role === 'moniteur' && (
        <TouchableOpacity
          style={{
            backgroundColor: '#7ED957',
            padding: 16,
            borderRadius: 12,
            marginHorizontal: 20,
            marginTop: 24,
            alignItems: 'center'
          }}
          onPress={() => navigation.navigate('MesPostes')}
        >
          <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>Gérer mes postes</Text>
        </TouchableOpacity>
      )}
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
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  iconButton: {
    padding: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 4,
    width: '100%',
  },
  imageContainer: {
    aspectRatio: 1.8,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  carImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayBadges: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
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
  badgeText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  moniteurName: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    color: '#7ED957',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 6,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
    marginHorizontal: 4,
  },
  label: {
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
    color: '#222',
  },
  postButton: {
    backgroundColor: '#FFB800',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  badgeYellowBorder: {
    borderWidth: 2,
    borderColor: '#FFD600', // Jaune vif
  },
}); 