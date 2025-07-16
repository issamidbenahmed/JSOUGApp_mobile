import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface PosteCardProps {
  poste: any;
  onBook?: () => void;
}

type RootStackParamList = {
  BookingScreen: { moniteurId: number; posteId: number };
  // autres écrans si besoin
};

const BASE_URL = 'http://localhost:5000';

const PosteCard: React.FC<PosteCardProps> = ({ poste, onBook }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [cardWidth, setCardWidth] = useState<number | null>(null);
  // Images de voiture (slider) : toutes les images de toutes les voitures du poste
  let carImages: string[] = [];
  if (poste.cars && poste.cars.length > 0) {
    poste.cars.forEach((car: any, idx: number) => {
      if (Array.isArray(car.photos)) {
        car.photos.forEach((p: any, pidx: number) => {
          let url = typeof p === 'string' ? p : (p && p.photo_url ? p.photo_url : null);
          console.log('Car', idx, 'Photo', pidx, 'URL:', url);
          if (url) {
            carImages.push(url.startsWith('http') ? url : BASE_URL + url);
          }
        });
      }
    });
  } else if (poste.car?.photo) {
    carImages = [poste.car.photo.startsWith('http') ? poste.car.photo : BASE_URL + poste.car.photo];
  }

  // Slider state pour les points indicateurs
  const [currentIndex, setCurrentIndex] = useState(0);
  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });
  const avatar = poste.moniteur?.avatar
    ? { uri: BASE_URL + poste.moniteur.avatar }
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
    <View style={styles.card} onLayout={e => setCardWidth(e.nativeEvent.layout.width)}>
      {/* Slider d'images voiture */}
      {carImages.length > 1 ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            style={{ marginBottom: 12 }}
            onScroll={e => {
              if (!cardWidth) return;
              const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
              setCurrentIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {carImages.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.imageContainer,
                  cardWidth ? { width: cardWidth * 0.91, aspectRatio: 1.8, marginBottom: 12, alignSelf: 'center' } : { width: '91%', alignSelf: 'center' }
                ]}
              >
                <Image
                  source={{ uri: item }}
                  style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.dotsContainer}>
            {carImages.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, currentIndex === idx && styles.dotActive]}
              />
            ))}
          </View>
        </>
      ) : carImages.length === 1 ? (
        <View
          style={[
            styles.imageContainer,
            cardWidth ? { width: cardWidth * 0.91, aspectRatio: 1.8, marginBottom: 12, alignSelf: 'center' } : { width: '91%', alignSelf: 'center' }
          ]}
        >
          <Image
            source={{ uri: carImages[0] }}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          />
        </View>
      ) : (
        <View
          style={[
            styles.imageContainer,
            { justifyContent: 'center', alignItems: 'center' },
            cardWidth ? { width: cardWidth * 0.91, aspectRatio: 1.8, marginBottom: 12, alignSelf: 'center' } : { width: '91%', alignSelf: 'center' }
          ]}
        >
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
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookingScreen', { moniteurId: poste.moniteur?.id, posteId: poste.id || poste.poste_id })}
        >
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
    overflow: 'hidden', // Empêche les images de dépasser
  },
  imageContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  carImage: {
    width: '100%',
    aspectRatio: 1.8,
    // borderRadius: 18, // SUPPRIMÉ, le borderRadius est sur le conteneur
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
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: '#FFB800',
  },
});

export default PosteCard; 