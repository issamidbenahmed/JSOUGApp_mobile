import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ChatScreen = ({ route, navigation }: any) => {
  const { conversationId } = route.params;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<{ fullName: string; avatar: string | null, id?: number } | null>(null);
  const [online, setOnline] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Récupérer infos de l'autre utilisateur et messages
  useEffect(() => {
    let statusInterval: any;
    const fetchAll = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      let userId = null;
      try {
        // Récupérer l'id utilisateur courant
        const userInfo = await fetch('http://localhost:5000/api/moniteur/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userInfo.json();
        userId = userData.id;
        setCurrentUserId(userId);
        // Récupérer la conversation pour afficher l'autre utilisateur
        const convRes = await fetch(`http://localhost:5000/api/moniteur/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const convs = await convRes.json();
        const conv = convs.find((c: any) => c.id === conversationId || c.id === Number(conversationId));
        if (conv) {
          setOtherUser({ fullName: conv.fullName || 'Utilisateur', avatar: conv.avatar || null, id: conv.user1_id === userId ? conv.user2_id : conv.user1_id });
        }
        // Récupérer les messages
        const res = await fetch(`http://localhost:5000/api/moniteur/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        setMessages([]);
      }
      setLoading(false);
    };
    fetchAll();
    return () => { if (statusInterval) clearInterval(statusInterval); };
  }, [conversationId]);

  // Rafraîchir le statut en ligne toutes les 30s
  useEffect(() => {
    let interval: any;
    const fetchStatus = async () => {
      if (!otherUser?.id) return;
      const token = await AsyncStorage.getItem('userToken');
      try {
        const res = await fetch(`http://localhost:5000/api/moniteur/user-status/${otherUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOnline(!!data.online);
      } catch (err) {
        setOnline(false);
      }
    };
    if (otherUser?.id) {
      fetchStatus();
      interval = setInterval(fetchStatus, 30000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [otherUser?.id]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const token = await AsyncStorage.getItem('userToken');
    try {
      const res = await fetch(`http://localhost:5000/api/moniteur/messages/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (res.status === 200) {
        setMessages([...messages, { ...data, sender_id: data.sender_id, text: data.text, created_at: data.created_at }]);
        setInput('');
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (err) {}
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FFA800" />;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header avec flèche, avatar, nom et statut dynamique */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        {otherUser && (
          <>
            <Image
              source={otherUser.avatar ? { uri: otherUser.avatar.startsWith('http') ? otherUser.avatar : 'http://localhost:5000' + otherUser.avatar } : require('../assets/jsoug-logo.png')}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.headerName}>{otherUser.fullName}</Text>
              <Text style={[styles.onlineStatus, { color: online ? '#4CAF50' : '#888' }]}>{online ? 'En ligne' : 'Hors ligne'}</Text>
            </View>
          </>
        )}
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const isMe = currentUserId && item.sender_id === currentUserId;
          return (
            <View style={{ marginBottom: 12 }}>
              <View style={[styles.messageRow, isMe ? styles.me : styles.other]}>
                <Text style={isMe ? styles.meText : styles.otherText}>{item.text}</Text>
              </View>
              <Text style={[styles.time, isMe ? styles.timeMe : styles.timeOther]}>{item.created_at ? new Date(item.created_at).toLocaleTimeString() : ''}</Text>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Aa"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  headerName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  onlineStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
  messageRow: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 12,
    minHeight: 36,
  },
  me: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFA800',
    borderTopRightRadius: 6,
  },
  other: {
    alignSelf: 'flex-start',
    backgroundColor: '#F6F6F6',
    borderTopLeftRadius: 6,
  },
  meText: {
    color: '#fff',
    fontSize: 16,
  },
  otherText: {
    color: '#222',
    fontSize: 16,
  },
  time: {
    fontSize: 12,
    marginTop: 2,
    marginHorizontal: 8,
  },
  timeMe: {
    color: '#FFA800',
    alignSelf: 'flex-end',
  },
  timeOther: {
    color: '#888',
    alignSelf: 'flex-start',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#F6F6F6',
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#FFA800',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChatScreen; 