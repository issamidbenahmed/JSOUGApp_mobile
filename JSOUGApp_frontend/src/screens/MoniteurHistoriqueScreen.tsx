import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api/moniteur';

interface Transaction {
  id: number;
  type: string; // 'recharge' | 'commission'
  amount: number;
  date: string;
  description?: string;
}

const MoniteurHistoriqueScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    return await AsyncStorage.getItem('userToken');
  };

  const fetchData = async () => {
    setLoading(true);
    const token = await getToken();
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger l\'historique.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des transactions</Text>
      {loading ? <ActivityIndicator size="large" color="#FFA800" /> : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.type}>{item.type === 'recharge' ? 'Recharge' : 'Commission'}</Text>
              <Text style={styles.amount}>{item.amount > 0 ? '+' : ''}{item.amount} MAD</Text>
              <Text style={styles.date}>{item.date}</Text>
              {item.description && <Text style={styles.desc}>{item.description}</Text>}
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#888', marginTop: 20 }}>Aucune transaction.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  card: { backgroundColor: '#F6F6F6', borderRadius: 12, padding: 16, marginBottom: 12 },
  type: { fontWeight: 'bold', fontSize: 16, color: '#FFA800' },
  amount: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  date: { color: '#888', fontSize: 13, marginTop: 2 },
  desc: { color: '#444', marginTop: 4 },
});

export default MoniteurHistoriqueScreen; 