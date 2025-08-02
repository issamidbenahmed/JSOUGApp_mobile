import React, { useState, useEffect } from 'react';
import {
 View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, FlatList, Alert, Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { updateMoniteurDetails } from '../services/api';
import * as FileSystem from 'expo-file-system';
import { getNotifications } from '../services/api';

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

export default function MoniteurInfoScreen() {
  const navigation = useNavigation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  // Permis
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  // Prix
  const [price, setPrice] = useState('');
  // Description
  const [description, setDescription] = useState('');
  // Locations
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');
  // Voitures
  const [cars, setCars] = useState<any[]>([]);
  // Certificats
  const [certImages, setCertImages] = useState<string[]>([]);
  // Loading state
  const [isSaving, setIsSaving] = useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  useEffect(() => {
    const fetchProfileAndDetails = async () => {
      const token = await AsyncStorage.getItem('userToken');
      try {
        // Fetch profile (avatar, name)
        const profileRes = await axios.get('http://localhost:5000/api/moniteur/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvatarUrl(profileRes.data.avatar ? 'http://localhost:5000' + profileRes.data.avatar : null);
        setFullName(profileRes.data.fullName || 'Moniteur');

        // Fetch all details
        const detailsRes = await axios.get('http://localhost:5000/api/moniteur/details', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Set all state from details
        setSelectedLicenses(detailsRes.data.licenses?.map((l: any) => l.type) || []);
        setPrice(detailsRes.data.price ? String(detailsRes.data.price) : '');
        setDescription(detailsRes.data.description || '');
        setLocations(detailsRes.data.locations?.map((l: any) => l.place) || []);
        setCars(detailsRes.data.cars || []);
        setCertImages(detailsRes.data.certificates?.map((c: any) => c.photo_url) || []);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchProfileAndDetails();
  }, []);

  React.useEffect(() => {
    const fetchUnread = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const notifs = await getNotifications(token);
      if (Array.isArray(notifs)) {
        setUnreadCount(notifs.filter((n: any) => !n.is_read).length);
      }
    };
    fetchUnread();
  }, []);

  // Sélection permis
  const toggleLicense = (type: string) => {
    setSelectedLicenses(licenses =>
      licenses.includes(type)
        ? licenses.filter(l => l !== type)
        : [...licenses, type]
    );
  };

  // Ajout location
  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  // Suppression location
  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  // Ajouter une voiture
  const addCar = () => {
    setCars([...cars, {
      model: '',
      transmission: 'manuelle',
      fuel_type: 'essence',
      price: '',
      photos: [],
    }]);
  };

  // Modifier une propriété d'une voiture
  const updateCar = (index: number, key: string, value: any) => {
    setCars(cars => cars.map((car, i) => i === index ? { ...car, [key]: value } : car));
  };

  // Ajouter une photo à une voiture
  const addCarPhoto = async (carIndex: number) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCars(cars => cars.map((car, i) =>
        i === carIndex ? { ...car, photos: [...car.photos, result.assets[0].uri] } : car
      ));
    }
  };

  // Supprimer une photo d'une voiture
  const removeCarPhoto = (carIndex: number, photoIndex: number) => {
    setCars(cars => cars.map((car, i) =>
      i === carIndex ? { ...car, photos: car.photos.filter((_: string, j: number) => j !== photoIndex) } : car
    ));
  };

  // Supprimer une voiture
  const removeCar = (index: number) => {
    setCars(cars => cars.filter((_, i) => i !== index));
  };

  // Ajout image certificat
  const addCertImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCertImages([...certImages, result.assets[0].uri]);
    }
  };

  // Suppression image certificat
  const removeCertImage = (index: number) => {
    setCertImages(certImages.filter((_, i) => i !== index));
  };

  // Helper to upload an image and get the URL from the backend (EXACT same process as profile picture, platform-specific)
  const uploadImageToBackend = async (uri: string, endpoint: string, token: string) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      // On web, fetch the blob from the uri and append as Blob
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('photo', blob, 'photo.jpg');
    } else {
      // On mobile, use the { uri, name, type } object
      formData.append('photo', {
        uri: uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);
    }
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    return data.photo_url;
  };

  // Helper to get the full image URL
  const getImageUrl = (url: string) => {
    if (url && url.startsWith('/uploads/')) {
      return 'http://localhost:5000' + url;
    }
    return url;
  };

  // handleSave: Ensures all car/certificate images are uploaded to backend and only /uploads/ URLs are saved
  const handleSave = async () => {
    setIsSaving(true);
    const token = await AsyncStorage.getItem('userToken');
    try {
      // 1. Upload des nouvelles images de voitures
      const carsWithUploadedPhotos = await Promise.all(cars.map(async (car) => {
        const uploadedPhotos = await Promise.all(
          (car.photos || []).map(async (photo: any) => {
            // Si l'image est déjà sur le serveur (URL /uploads/), on la garde
            if (typeof photo === 'string' && photo.startsWith('/uploads/')) return photo;
            // Sinon, upload
            const formData = new FormData();
            if (Platform.OS === 'web') {
              // Sur web, fetch le blob depuis l'URL
              const response = await fetch(photo.uri || photo);
              const blob = await response.blob();
              formData.append('photo', blob, photo.fileName || 'car.webp');
            } else {
              formData.append('photo', {
                uri: photo.uri || photo,
                name: photo.fileName || 'car.jpg',
                type: photo.type || 'image/jpeg',
              } as any);
            }
            const res = await fetch('http://localhost:5000/api/moniteur/car-photo', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: formData,
            });
            const data = await res.json();
            return data.photo_url;
          })
        );
        return { ...car, photos: uploadedPhotos };
      }));

      // 2. Upload des nouvelles images de certificats
      const uploadedCertImages = await Promise.all(
        certImages.map(async (img: any) => {
          if (typeof img === 'string' && img.startsWith('/uploads/')) return img;
          const formData = new FormData();
          if (Platform.OS === 'web') {
            const response = await fetch(img.uri || img);
            const blob = await response.blob();
            formData.append('photo', blob, img.fileName || 'certificate.webp');
          } else {
            formData.append('photo', {
              uri: img.uri || img,
              name: img.fileName || 'certificate.jpg',
              type: img.type || 'image/jpeg',
            } as any);
          }
          const res = await fetch('http://localhost:5000/api/moniteur/certificate', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          });
          const data = await res.json();
          return data.photo_url;
        })
      );

      // 3. Construction du payload groupé
      const payload = {
        licenses: selectedLicenses.map((type) => ({ type })),
        locations: locations.map((place) => ({ place })),
        cars: carsWithUploadedPhotos.map((car) => ({
          model: car.model,
          transmission: car.transmission,
          fuel_type: car.fuel_type,
          price: car.price,
          photos: car.photos,
        })),
        certificates: uploadedCertImages.map((photo_url) => ({ photo_url })),
        price: price,
        description: description,
      };

      // 4. Envoi groupé au backend
      const res = await updateMoniteurDetails(payload, token!);
      if (res && res.message) {
        Alert.alert('Succès', 'Les informations ont bien été enregistrées !');
      } else {
        Alert.alert('Erreur', res?.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err: any) {
      console.error('Error in handleSave:', err);
      Alert.alert('Erreur', err.message || 'Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Icon name="menu" size={28} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="bell-outline" size={28} color="#222" />
          {unreadCount > 0 && (
            <View style={{
              position: 'absolute', top: -4, right: -4, backgroundColor: '#FBB614', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.profileInfoContainer}>
        <Image
          source={avatarUrl ? { uri: getImageUrl(avatarUrl) } : { uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{fullName}</Text>
      </View>
      <Text style={styles.sectionTitle}>Permis</Text>
      <View style={styles.licenseRow}>
        {LICENSE_TYPES.map(lic => (
          <TouchableOpacity
            key={lic.type}
            style={[styles.licenseIcon, selectedLicenses.includes(lic.type) && styles.licenseIconSelected]}
            onPress={() => toggleLicense(lic.type)}
          >
            <Icon
              name={lic.icon}
              size={32}
              color={selectedLicenses.includes(lic.type) ? '#4BB543' : '#999'}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Prix (DHS)</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholder="5000"
      />
      <Text style={styles.sectionTitle}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        multiline
      />
      <Text style={styles.sectionTitle}>Location</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={newLocation}
          onChangeText={setNewLocation}
          placeholder="Add location"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addLocation}>
          <Icon name="plus" size={22} color="#FBB614" />
        </TouchableOpacity>
      </View>
      {locations.map((loc, idx) => (
        <View key={idx} style={styles.locationItem}>
          <Text>{loc}</Text>
          <TouchableOpacity onPress={() => removeLocation(idx)}>
            <Icon name="close" size={18} color="#F44336" />
          </TouchableOpacity>
        </View>
      ))}
      <Text style={styles.sectionTitle}>Voitures</Text>
      {cars.map((car, idx) => (
        <View key={idx} style={styles.carBox}>
          <TextInput
            style={styles.input}
            placeholder="Modèle"
            value={car.model}
            onChangeText={text => updateCar(idx, 'model', text)}
          />
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TouchableOpacity
              style={[
                styles.carOptionBtn,
                car.transmission === 'manuelle' && styles.carOptionBtnSelected,
              ]}
              onPress={() => updateCar(idx, 'transmission', 'manuelle')}
            >
              <Text style={{ color: car.transmission === 'manuelle' ? '#fff' : '#222' }}>Manuelle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.carOptionBtn,
                car.transmission === 'automatique' && styles.carOptionBtnSelected,
              ]}
              onPress={() => updateCar(idx, 'transmission', 'automatique')}
            >
              <Text style={{ color: car.transmission === 'automatique' ? '#fff' : '#222' }}>Automatique</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TouchableOpacity
              style={[
                styles.carOptionBtn,
                car.fuel_type === 'essence' && styles.carOptionBtnSelected,
              ]}
              onPress={() => updateCar(idx, 'fuel_type', 'essence')}
            >
              <Text style={{ color: car.fuel_type === 'essence' ? '#fff' : '#222' }}>Essence</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.carOptionBtn,
                car.fuel_type === 'diesel' && styles.carOptionBtnSelected,
              ]}
              onPress={() => updateCar(idx, 'fuel_type', 'diesel')}
            >
              <Text style={{ color: car.fuel_type === 'diesel' ? '#fff' : '#222' }}>Diesel</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Prix"
            value={car.price}
            onChangeText={text => updateCar(idx, 'price', text)}
            keyboardType="numeric"
          />
          <FlatList
            data={[...car.photos, 'add']}
            horizontal
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) =>
              item === 'add' ? (
                <TouchableOpacity style={styles.addImageBox} onPress={() => addCarPhoto(idx)}>
                  <Icon name="camera" size={32} color="#FBB614" />
                  <Text style={{ color: '#FBB614', fontSize: 12 }}>Add car images</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.imageBox}>
                  <Image source={{ uri: getImageUrl(item) }} style={styles.image} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeCarPhoto(idx, index)}>
                    <Icon name="close-circle" size={22} color="#F44336" />
                  </TouchableOpacity>
                </View>
              )
            }
            style={{ marginBottom: 8 }}
          />
          <TouchableOpacity style={styles.removeCarBtn} onPress={() => removeCar(idx)}>
            <Text style={styles.removeCarBtnText}>Supprimer cette voiture</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addCarBtn} onPress={addCar}>
        <Text style={{ color: '#FBB614', fontWeight: 'bold' }}>+ Ajouter une voiture</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Certificates</Text>
      <FlatList
        data={[...certImages, 'add']}
        horizontal
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) =>
          item === 'add' ? (
            <TouchableOpacity style={styles.addImageBox} onPress={addCertImage}>
              <Icon name="camera" size={32} color="#FBB614" />
              <Text style={{ color: '#FBB614', fontSize: 12 }}>Add Certificates</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imageBox}>
              <Image source={{ uri: getImageUrl(item) }} style={styles.image} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeCertImage(index)}>
                <Icon name="close-circle" size={22} color="#F44336" />
              </TouchableOpacity>
            </View>
          )
        }
        style={{ marginBottom: 32 }}
      />
      <TouchableOpacity 
        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]} 
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveBtnText}>
          {isSaving ? 'Sauvegarde...' : 'Save'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1, // supprimé pour permettre le scroll
    backgroundColor: '#fff',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBB614',
    top: 3,
    right: 0,
  },
  profileInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginBottom: 8,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#222',
    marginBottom: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 18,
    marginBottom: 8,
    color: '#222',
  },
  licenseRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  licenseIcon: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    padding: 10,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  licenseIconSelected: {
    borderColor: '#4BB543',
    backgroundColor: '#E8F5E9',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addBtn: {
    marginLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FBB614',
    padding: 6,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  addImageBox: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBB614',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFF9F0',
  },
  imageBox: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  saveBtn: {
    backgroundColor: '#FBB614',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  saveBtnDisabled: {
    backgroundColor: '#ccc',
  },
  carBox: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  carOptionBtn: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  carOptionBtnSelected: {
    backgroundColor: '#FBB614',
    borderColor: '#FBB614',
  },
  removeCarBtn: {
    backgroundColor: '#F44336',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
  },
  removeCarBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  addCarBtn: {
    borderWidth: 1,
    borderColor: '#FBB614',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF9F0',
  },
});