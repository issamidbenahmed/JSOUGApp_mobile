import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PosteCardProps {
  poste: any;
  onBook?: () => void;
}

const PosteCard: React.FC<PosteCardProps> = ({ poste, onBook }) => {
  const carPhoto = poste.car?.photo
    ? (poste.car.photo.startsWith('http') ? poste.car.photo : 'http://localhost:5000' + poste.car.photo)
    : null;
  const avatar = poste.moniteur?.avatar
    ? { uri: 'http://localhost:5000' + poste.moniteur.avatar }
    : null;

  // Ajoute ce mapping pour les icônes de permis
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

  return (
    <View style={styles.card}>
      {/* Image voiture */}
      {carPhoto ? (
        <Image source={{ uri: carPhoto }} style={styles.carImage} />
      ) : (
        <View style={[styles.carImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}> 
          <Icon name="car" size={48} color="#bbb" />
        </View>
      )}
      {/* Badges transmission, carburant, permis (exemple) */}
      <View style={styles.badgesRow}>
        {poste.car?.transmission && (
          <View style={[styles.badge, styles.badgeYellowBorder]}>
            <Text style={styles.badgeText}>{poste.car.transmission}</Text>
          </View>
        )}
        {poste.car?.fuel_type && (
          <View style={[styles.badge, styles.badgeYellowBorder]}>
            <Icon name={poste.car.fuel_type === 'essence' ? 'gas-station' : 'fuel'} size={18} color="#222" />
          </View>
        )}
        {/* Affiche les icônes des permis du moniteur */}
        {poste.licenses && poste.licenses.map((type: string, idx: number) => {
          const found = LICENSE_TYPES.find(t => t.type === type);
          return (
            <View key={idx} style={[styles.badge, styles.badgeYellowBorder]}>
              <Icon name={found ? found.icon : 'card-account-details-outline'} size={18} color="#222" />
            </View>
          );
        })}
      </View>
      {/* Description */}
      <Text style={styles.cardTitle} numberOfLines={2}>{poste.description}</Text>
      {/* Moniteur */}
      <View style={styles.cardFooter}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {avatar && <Image source={avatar} style={styles.avatar} />}
          <View>
            <Text style={styles.moniteurName}>{poste.moniteur?.fullName}</Text>
            {poste.location && (
              <Text style={styles.locationText}>{poste.location}</Text>
            )}
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="star" size={16} color="#FFB800" />
          <Text style={{ marginLeft: 2, color: '#222', fontWeight: 'bold' }}>4,5</Text>
        </View>
      </View>
      {/* Prix et bouton */}
      <View style={styles.priceRow}>
        <Text style={styles.priceText}>{poste.price} DHS/h</Text>
        <TouchableOpacity style={styles.bookButton} onPress={onBook}>
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  carImage: {
    width: '100%',
    aspectRatio: 1.8,
    borderRadius: 18,
    resizeMode: 'cover',
    marginBottom: 12,
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
  badgeYellowBorder: {
    borderWidth: 2,
    borderColor: '#FFD600',
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
  locationText: {
    color: '#888',
    fontSize: 13,
    marginLeft: 2,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  priceText: {
    color: '#7ED957',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 6,
  },
  bookButton: {
    backgroundColor: '#FFB800',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PosteCard; 