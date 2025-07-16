import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MessagesScreen = ({ navigation }: any) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      try {
        const res = await fetch('http://localhost:5000/api/moniteur/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        setConversations([]);
      }
      setLoading(false);
    };
    fetchConversations();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FFA800" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChatScreen', { conversationId: item.id })}>
            <Image
              source={item.avatar ? { uri: item.avatar.startsWith('http') ? item.avatar : 'http://localhost:5000' + item.avatar } : require('../assets/jsoug-logo.png')}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.fullName || 'Utilisateur'}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>{item.last_message}</Text>
            </View>
            <Text style={styles.date}>{item.last_date ? new Date(item.last_date).toLocaleString() : ''}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Aucune conversation</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#222',
  },
  lastMessage: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  date: {
    color: '#B0B0B0',
    fontSize: 13,
    marginLeft: 8,
  },
});

export default MessagesScreen; 