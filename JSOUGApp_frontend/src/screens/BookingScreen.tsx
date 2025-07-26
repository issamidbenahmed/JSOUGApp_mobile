// Pour utiliser ce composant, installez 'react-native-calendars' et 'react-native-elements' si ce n'est pas déjà fait.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { CheckBox } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const timeSlots = [
  { label: 'Matinée', value: 'morning' },
  { label: 'Après-midi', value: 'afternoon' },
];

const hours = [
  '07:00', '09:00', '11:00',
  '13:00', '15:00', '17:00', '19:00'
];

const BookingScreen = ({ route, navigation }: any) => {
  const { moniteurId, posteId } = route.params || {};
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState('morning');
  const [selectedHour, setSelectedHour] = useState('07:00');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot || !selectedHour) {
      Alert.alert('Erreur', 'Veuillez choisir une date, un créneau et une heure.');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      // Vérifier la disponibilité
      const checkRes = await fetch(`http://localhost:5000/api/moniteur/booking/check?poste_id=${posteId}&date=${selectedDate}&slot=${selectedSlot}&hour=${selectedHour}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const checkData = await checkRes.json();
      if (checkData.taken) {
        Alert.alert('Créneau indisponible', 'Ce créneau est déjà réservé.');
        setLoading(false);
        return;
      }
      // Log des paramètres envoyés
      console.log('Booking params:', {
        moniteur_id: moniteurId,
        poste_id: posteId,
        date: selectedDate,
        slot: selectedSlot,
        hour: selectedHour,
      });
      // Créer la réservation
      const bookRes = await fetch('http://localhost:5000/api/moniteur/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          moniteur_id: moniteurId,
          poste_id: posteId,
          date: selectedDate,
          slot: selectedSlot,
          hour: selectedHour,
        }),
      });
      const bookData = await bookRes.json();
      // Log de la réponse du backend
      console.log('Réponse booking:', bookRes.status, bookData);
      if (bookRes.status === 200 && bookData.success) {
        Alert.alert('Réservation confirmée', 'Votre séance a bien été réservée.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Erreur', bookData.error || 'Erreur lors de la réservation.');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur réseau ou serveur.');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Réserver</Text>
        <TouchableOpacity onPress={() => {/* action notifications */}} style={styles.iconButton}>
          <Icon name="bell-outline" size={26} color="#222" />
        </TouchableOpacity>
      </View>
      <Calendar
        current={todayStr}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#FFA800' },
        }}
        theme={{
          todayTextColor: '#FFA800',
          selectedDayBackgroundColor: '#FFA800',
          arrowColor: '#FFA800',
          textSectionTitleColor: '#FFA800',
        }}
        style={styles.calendar}
      />
      <Text style={styles.pickTime}>Choisissez l'heure</Text>
      <View style={styles.slotRow}>
        {timeSlots.map(slot => (
          <TouchableOpacity
            key={slot.value}
            style={[styles.slotBtn, selectedSlot === slot.value && styles.slotBtnActive]}
            onPress={() => setSelectedSlot(slot.value)}
          >
            <Text style={[styles.slotText, selectedSlot === slot.value && styles.slotTextActive]}>{slot.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.hourRow}>
        {hours.map(hour => (
          <TouchableOpacity
            key={hour}
            style={[styles.hourBtn, selectedHour === hour && styles.hourBtnActive]}
            onPress={() => setSelectedHour(hour)}
          >
            <Text style={[styles.hourText, selectedHour === hour && styles.hourTextActive]}>{hour}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Supprimé : Option à cocher */}
      {/* <View style={styles.checkboxRow}>
        <CheckBox
          checked={includeCleaning}
          onPress={() => setIncludeCleaning(!includeCleaning)}
          checkedColor="#FFA800"
          uncheckedColor="#FFA800"
          containerStyle={{ padding: 0, margin: 0 }}
        />
        <Text style={styles.checkboxLabel}>Include cleaning Instruments</Text>
      </View> */}
      <TouchableOpacity style={styles.bookBtn} onPress={handleBook} disabled={loading}>
        <Text style={styles.bookBtnText}>{loading ? 'Réservation...' : 'Réserver'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
  },
  arrowRow: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowBtn: {
    backgroundColor: '#F6F6F6',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  arrow: {
    fontSize: 18,
    color: '#222',
  },
  calendar: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pickTime: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
    marginBottom: 8,
  },
  slotRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  slotBtn: {
    backgroundColor: '#fff',
    borderColor: '#E5E5E5',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  slotBtnActive: {
    backgroundColor: '#FFA800',
    borderColor: '#FFA800',
  },
  slotText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 16,
  },
  slotTextActive: {
    color: '#fff',
  },
  hourRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  hourBtn: {
    backgroundColor: '#fff',
    borderColor: '#E5E5E5',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  hourBtnActive: {
    backgroundColor: '#F6F6F6',
    borderColor: '#FFA800',
  },
  hourText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 16,
  },
  hourTextActive: {
    color: '#FFA800',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    color: '#888',
    marginLeft: 8,
    fontSize: 14,
  },
  bookBtn: {
    backgroundColor: '#FFA800',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  iconButton: {
    padding: 8,
  },
});

export default BookingScreen; 