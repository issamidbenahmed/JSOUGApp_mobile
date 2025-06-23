import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Text, Button } from '../components';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { verifyOtp } from '../services/api';

const OTPVerificationScreen = ({ route, navigation }: any) => {
  const [otp, setOtp] = useState<string[]>([]);
  const [timer, setTimer] = useState(60); // 60 seconds countdown

  const phoneNumber = route?.params?.phone || '(+212) 999 999 999';

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = (value: string) => {
    if (otp.length < 4) {
      setOtp((prev) => [...prev, value]);
    }
  };

  const handleDelete = () => {
    setOtp((prev) => prev.slice(0, -1));
  };

  const renderKey = (value: string, icon?: string) => (
    <TouchableOpacity
      key={value}
      onPress={icon ? handleDelete : () => handleKeyPress(value)}
      style={{
        flex: 1,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 6,
        borderRadius: 10,
        backgroundColor: '#f2f2f2',
      }}
    >
      {icon ? (
        <Icon name={icon} size={24} />
      ) : (
        <Text style={{ fontSize: 22 }}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  const keypad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'backspace'],
  ];

  const renderOtpBox = (index: number) => (
    <View
      key={index}
      style={{
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 6,
        borderRadius: 8,
      }}
    >
      <Text style={{ fontSize: 24 }}>{otp[index] || ''}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: 'white', justifyContent: 'center' }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <Icon name="arrow-left" size={24} />
      </TouchableOpacity>

      <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 12 }}>
        OTP Verification
      </Text>

      <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 16 }}>
        An authentication code has been sent to{"\n"}
        <Text style={{ fontWeight: 'bold', color: '#FFA000' }}>{phoneNumber}</Text>
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
        {[0, 1, 2, 3].map(renderOtpBox)}
      </View>

      <Button
        mode="contained"
        disabled={otp.length < 4}
        style={{ borderRadius: 12, paddingVertical: 6, marginBottom: 16 }}
        buttonColor="#FFB800"
        onPress={async () => {
          if (otp.length === 4) {
            const code = otp.join('');
            const res = await verifyOtp(phoneNumber, code);
            if (res.message) {
              navigation.replace('RegisterScreen');
            } else {
              Alert.alert('Erreur', res.error || "Code OTP invalide ou expiré");
            }
          }
        }}
      >
        Submit
      </Button>

      <Text style={{ textAlign: 'center' }}>
        Code Sent. Resend Code in{' '}
        <Text style={{ color: '#FFA000' }}>00:{timer.toString().padStart(2, '0')}</Text>
      </Text>

      {/* Custom Keypad */}
      <View style={{ marginTop: 24 }}>
        {keypad.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {row.map((key) =>
              key === '' ? (
                <View key={`spacer-${rowIndex}`} style={{ flex: 1, margin: 6 }} />
              ) : key === 'backspace' ? (
                renderKey('delete', 'backspace-outline')
              ) : (
                renderKey(key)
              )
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default OTPVerificationScreen; 