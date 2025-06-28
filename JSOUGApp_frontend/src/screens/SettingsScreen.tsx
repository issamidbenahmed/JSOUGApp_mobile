import React from 'react';
import { View, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function SettingsScreen({ navigation }: any) {
  useFocusEffect(
    React.useCallback(() => {
      navigation.navigate('EditProfile');
    }, [navigation])
  );
  return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Redirecting to Edit Profile...</Text></View>;
} 