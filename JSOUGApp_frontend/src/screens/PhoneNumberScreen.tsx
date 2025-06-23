import React, { useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, Modal, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CountryFlag from 'react-native-country-flag';
import { sendOtp } from '../services/api';

// Custom flag component using actual country flag images
const FlagIcon = ({ countryCode, size = 24, style }: { countryCode: string; size?: number; style?: any }) => {
  return (
    <CountryFlag
      isoCode={countryCode.toLowerCase()}
      size={size}
      style={style}
    />
  );
};

// Custom country data with ISO codes for flags
const countries = [
  { code: 'MA', name: 'Morocco', flagCode: 'MA', callingCode: '212' },
  { code: 'US', name: 'United States', flagCode: 'US', callingCode: '1' },
  { code: 'GB', name: 'United Kingdom', flagCode: 'GB', callingCode: '44' },
  { code: 'FR', name: 'France', flagCode: 'FR', callingCode: '33' },
  { code: 'DE', name: 'Germany', flagCode: 'DE', callingCode: '49' },
  { code: 'ES', name: 'Spain', flagCode: 'ES', callingCode: '34' },
  { code: 'IT', name: 'Italy', flagCode: 'IT', callingCode: '39' },
  { code: 'CA', name: 'Canada', flagCode: 'CA', callingCode: '1' },
  { code: 'AU', name: 'Australia', flagCode: 'AU', callingCode: '61' },
  { code: 'JP', name: 'Japan', flagCode: 'JP', callingCode: '81' },
  { code: 'CN', name: 'China', flagCode: 'CN', callingCode: '86' },
  { code: 'IN', name: 'India', flagCode: 'IN', callingCode: '91' },
  { code: 'BR', name: 'Brazil', flagCode: 'BR', callingCode: '55' },
  { code: 'MX', name: 'Mexico', flagCode: 'MX', callingCode: '52' },
  { code: 'AR', name: 'Argentina', flagCode: 'AR', callingCode: '54' },
  { code: 'ZA', name: 'South Africa', flagCode: 'ZA', callingCode: '27' },
  { code: 'EG', name: 'Egypt', flagCode: 'EG', callingCode: '20' },
  { code: 'SA', name: 'Saudi Arabia', flagCode: 'SA', callingCode: '966' },
  { code: 'AE', name: 'United Arab Emirates', flagCode: 'AE', callingCode: '971' },
  { code: 'TR', name: 'Turkey', flagCode: 'TR', callingCode: '90' },
  { code: 'RU', name: 'Russia', flagCode: 'RU', callingCode: '7' },
  { code: 'KR', name: 'South Korea', flagCode: 'KR', callingCode: '82' },
  { code: 'SG', name: 'Singapore', flagCode: 'SG', callingCode: '65' },
  { code: 'NL', name: 'Netherlands', flagCode: 'NL', callingCode: '31' },
  { code: 'SE', name: 'Sweden', flagCode: 'SE', callingCode: '46' },
  { code: 'NO', name: 'Norway', flagCode: 'NO', callingCode: '47' },
  { code: 'DK', name: 'Denmark', flagCode: 'DK', callingCode: '45' },
  { code: 'FI', name: 'Finland', flagCode: 'FI', callingCode: '358' },
  { code: 'CH', name: 'Switzerland', flagCode: 'CH', callingCode: '41' },
  { code: 'AT', name: 'Austria', flagCode: 'AT', callingCode: '43' },
  { code: 'BE', name: 'Belgium', flagCode: 'BE', callingCode: '32' },
  { code: 'PT', name: 'Portugal', flagCode: 'PT', callingCode: '351' },
  { code: 'IE', name: 'Ireland', flagCode: 'IE', callingCode: '353' },
  { code: 'PL', name: 'Poland', flagCode: 'PL', callingCode: '48' },
  { code: 'CZ', name: 'Czech Republic', flagCode: 'CZ', callingCode: '420' },
  { code: 'HU', name: 'Hungary', flagCode: 'HU', callingCode: '36' },
  { code: 'RO', name: 'Romania', flagCode: 'RO', callingCode: '40' },
  { code: 'BG', name: 'Bulgaria', flagCode: 'BG', callingCode: '359' },
  { code: 'HR', name: 'Croatia', flagCode: 'HR', callingCode: '385' },
  { code: 'SI', name: 'Slovenia', flagCode: 'SI', callingCode: '386' },
  { code: 'SK', name: 'Slovakia', flagCode: 'SK', callingCode: '421' },
  { code: 'LT', name: 'Lithuania', flagCode: 'LT', callingCode: '370' },
  { code: 'LV', name: 'Latvia', flagCode: 'LV', callingCode: '371' },
  { code: 'EE', name: 'Estonia', flagCode: 'EE', callingCode: '372' },
  { code: 'GR', name: 'Greece', flagCode: 'GR', callingCode: '30' },
  { code: 'CY', name: 'Cyprus', flagCode: 'CY', callingCode: '357' },
  { code: 'MT', name: 'Malta', flagCode: 'MT', callingCode: '356' },
  { code: 'LU', name: 'Luxembourg', flagCode: 'LU', callingCode: '352' },
  { code: 'IS', name: 'Iceland', flagCode: 'IS', callingCode: '354' },
  { code: 'LI', name: 'Liechtenstein', flagCode: 'LI', callingCode: '423' },
  { code: 'MC', name: 'Monaco', flagCode: 'MC', callingCode: '377' },
  { code: 'AD', name: 'Andorra', flagCode: 'AD', callingCode: '376' },
  { code: 'SM', name: 'San Marino', flagCode: 'SM', callingCode: '378' },
  { code: 'VA', name: 'Vatican City', flagCode: 'VA', callingCode: '379' },
];

const PhoneNumberScreen = ({ navigation }: any) => {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Morocco by default
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleKeyPress = (value: string) => {
    setHasError(false);
    setPhoneNumber((prev) => prev + value);
  };

  const handleDelete = () => {
    setHasError(false);
    setPhoneNumber((prev) => prev.slice(0, -1));
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

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 12 }}>
        Welcome
      </Text>
      <Text style={{ fontSize: 18, marginBottom: 24 }}>
        Enter your phone number to get started.
      </Text>

      <TouchableOpacity 
        style={{ padding: 16, borderRadius: 12, marginBottom: 24, backgroundColor: '#f8f8f8' }}
        onPress={() => setShowCountryPicker(true)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FlagIcon
            countryCode={selectedCountry.flagCode}
            size={24}
            style={{ marginRight: 8 }}
          />
          <Text style={{ fontSize: 16, flex: 1 }}>{selectedCountry.name} (+{selectedCountry.callingCode})</Text>
          <Icon name="chevron-down" size={24} />
        </View>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: hasError ? 'red' : '#ccc',
            marginTop: 8,
            paddingVertical: 0,
          }}
        >
          <TextInput
            value={phoneNumber}
            editable={false}
            placeholder="Phone number"
            style={{
              fontSize: 18,
              letterSpacing: 1,
              paddingVertical: 12,
              color: '#222',
              backgroundColor: 'transparent',
            }}
          />
        </View>
      </TouchableOpacity>

      <Text style={{ textAlign: 'center', marginBottom: 24 }}>
        Privacy and agreements
      </Text>

      <TouchableOpacity
        style={{ 
          backgroundColor: '#FFB800', 
          borderRadius: 12, 
          paddingVertical: 16, 
          marginBottom: 24,
          alignItems: 'center'
        }}
        onPress={async () => {
          const cleanedNumber = phoneNumber.replace(/\D/g, '');
          if (!cleanedNumber || cleanedNumber.length < 9) {
            setHasError(true);
            Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide.');
            return;
          }
          setHasError(false);
          const fullPhone = `+${selectedCountry.callingCode}${cleanedNumber}`;
          console.log('Calling sendOtp API with:', fullPhone);
          const res = await sendOtp(fullPhone);
          console.log('sendOtp API response:', res);
          if (res.message) {
            navigation.navigate('OTPVerificationScreen', { phone: fullPhone });
          } else {
            Alert.alert('Erreur', res.error || "Impossible d'envoyer le code OTP");
          }
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Continue</Text>
      </TouchableOpacity>

      {/* Custom Keypad */}
      <View style={{ marginTop: 4 }}>
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

      {/* Custom Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, maxHeight: 400 }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Select Country</Text>
            </View>
            <ScrollView>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                  }}
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowCountryPicker(false);
                  }}
                >
                  <FlagIcon
                    countryCode={country.flagCode}
                    size={20}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ fontSize: 16, flex: 1 }}>{country.name}</Text>
                  <Text style={{ fontSize: 16, color: '#666' }}>+{country.callingCode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#eee' }}
              onPress={() => setShowCountryPicker(false)}
            >
              <Text style={{ textAlign: 'center', color: '#666' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PhoneNumberScreen;