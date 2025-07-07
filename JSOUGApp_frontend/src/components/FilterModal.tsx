import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';

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

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  locations: string[];
  initialFilters: {
    price: number;
    location: string;
    licenses: string[];
  };
}

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply, locations, initialFilters }) => {
  const [price, setPrice] = useState(initialFilters.price || 0);
  const [location, setLocation] = useState(initialFilters.location || '');
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>(initialFilters.licenses || []);

  const toggleLicense = (type: string) => {
    setSelectedLicenses((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.handle} />
          <Text style={styles.title}>Filtre de Recherche</Text>
          {/* Prix */}
          <Text style={styles.label}>Prix</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderValue}>0</Text>
            <Text style={styles.sliderValue}>{price}</Text>
            <Text style={styles.sliderValue}>500</Text>
          </View>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={500}
            step={10}
            minimumTrackTintColor="#FFB800"
            maximumTrackTintColor="#eee"
            thumbTintColor="#FFB800"
            value={price}
            onValueChange={setPrice}
          />
          {/* Location */}
          <Text style={styles.label}>Location</Text>
          <View style={styles.locationInputRow}>
            <Icon name="map-marker-outline" size={22} color="#B0B0B0" />
            <TextInput
              style={styles.locationInput}
              placeholder="Ville..."
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
            />
          </View>
          {/* Permis */}
          <Text style={styles.label}>les type  de permis de conduire</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {LICENSE_TYPES.map((lic, idx) => (
              <TouchableOpacity
                key={lic.type}
                style={[
                  styles.licenseButton,
                  selectedLicenses.includes(lic.type) && styles.licenseButtonSelected,
                ]}
                onPress={() => toggleLicense(lic.type)}
              >
                <Icon name={lic.icon} size={28} color={selectedLicenses.includes(lic.type) ? '#FFB800' : '#B0B0B0'} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Boutons */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => onApply({ price, location, licenses: selectedLicenses })}
          >
            <Text style={styles.applyButtonText}>Appliquer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: '#eee',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 18,
  },
  label: {
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
    marginTop: 10,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  sliderValue: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 10,
    marginLeft: 8,
  },
  licenseButton: {
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  licenseButtonSelected: {
    borderColor: '#FFB800',
    backgroundColor: '#FFF8E1',
  },
  applyButton: {
    backgroundColor: '#FFB800',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cancelButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default FilterModal; 