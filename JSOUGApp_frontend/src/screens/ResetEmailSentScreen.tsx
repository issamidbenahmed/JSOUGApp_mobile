import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ResetEmailSentScreen = ({ navigation }: any) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Icon name="arrow-left" size={24} color="#000" />
    </TouchableOpacity>

    <Text style={styles.title}>Reset email sent</Text>
    <Text style={[styles.subtitle, { marginTop: 8, maxWidth: 280 }]}>We have sent all required instructions details to your mail.</Text>

    <Button
      mode="outlined"
      onPress={() => navigation.navigate('LoginScreen')}
      style={styles.goLoginButton}
      labelStyle={{ fontWeight: '600' }}
      contentStyle={{ height: 50, justifyContent: 'center' }}
      uppercase={false}
    >
      Go to Login page &rarr;
    </Button>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 26,
    paddingTop: 40,
    alignItems: 'center',
  },
  backButton: {
    marginBottom: 20,
    width: 24,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
  },
  goLoginButton: {
    marginTop: 32,
    borderRadius: 10,
    borderColor: '#FBB614',
  },
});

export default ResetEmailSentScreen; 