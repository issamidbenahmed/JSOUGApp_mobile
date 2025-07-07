import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PosteCard from '../components/PosteCard';
import FilterModal from '../components/FilterModal';

export default function StudentDashboardScreen({ navigation }: any) {
  const [postes, setPostes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({ price: 500, location: '', licenses: [] as string[] });

  useEffect(() => {
    const fetchPostes = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/moniteur/all-postes');
        const data = await res.json();
        setPostes(data);
      } catch (err) {
        Alert.alert('Erreur', 'Impossible de charger les offres');
      }
      setLoading(false);
    };
    fetchPostes();
  }, []);

  // Récupère toutes les localisations uniques pour le filtre
  const allLocations = Array.from(new Set(postes.map((p: any) => p.location).filter(Boolean)));

  // Filtrage
  const filteredPostes = postes.filter(poste => {
    const matchSearch =
      poste.moniteur?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      poste.description?.toLowerCase().includes(search.toLowerCase());
    const matchPrice = Number(poste.price) <= filters.price;
    const matchLocation = !filters.location || (poste.location && poste.location.toLowerCase().includes(filters.location.toLowerCase()));
    const matchLicenses = !filters.licenses.length || filters.licenses.some((lic: string) => poste.licenses?.includes(lic));
    return matchSearch && matchPrice && matchLocation && matchLicenses;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer && navigation.openDrawer()} style={styles.iconButton}>
          <Icon name="menu" size={28} color="#222" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#B0B0B0" style={{ marginRight: 4 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Mentors Name"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => setFilterVisible(true)}>
          <Icon name="filter-variant" size={22} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Filtre */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={f => {
          setFilters(f);
          setFilterVisible(false);
        }}
        locations={allLocations}
        initialFilters={filters}
      />
      {/* Liste des postes */}
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#FFB800" />
      ) : (
        <FlatList
          data={filteredPostes}
          keyExtractor={item => item.poste_id.toString()}
          renderItem={({ item }) => <PosteCard poste={item} onBook={() => Alert.alert('Book', 'Booking...')} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 6,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
}); 