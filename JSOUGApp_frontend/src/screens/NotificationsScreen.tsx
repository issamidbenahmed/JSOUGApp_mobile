import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
    const data = await getNotifications(token);
    setNotifications(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
    await markNotificationAsRead(id, token);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
    await markAllNotificationsAsRead(token);
    fetchNotifications();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.item, item.is_read ? styles.read : styles.unread]}
      onPress={() => handleMarkAsRead(item.id)}
      disabled={item.is_read}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
      {!item.is_read && <Text style={styles.badge}>Non lu</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12, padding: 4 }}>
          <Icon name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Text style={{ color: '#FFA800', fontWeight: 'bold' }}>Tout marquer comme lu</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Aucune notification</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  markAllBtn: { backgroundColor: '#eee', padding: 8, borderRadius: 8 },
  markAllText: { color: '#333', fontSize: 14 },
  item: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  unread: { backgroundColor: '#f9f9ff' },
  read: { backgroundColor: '#f5f5f5' },
  title: { fontWeight: 'bold', fontSize: 16 },
  body: { color: '#333', marginTop: 4 },
  date: { color: '#888', fontSize: 12, marginTop: 4 },
  badge: { color: '#fff', backgroundColor: '#007bff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 6, fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
});

export default NotificationsScreen; 