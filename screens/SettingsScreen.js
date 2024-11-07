import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useAppContext } from '../context/AppContext';

const SettingsScreen = ({ navigation }) => {
  const {
    isMusicMuted,
    isSoundMuted,
    isColorBlindMode,
    handleMusicToggle,
    handleSoundToggle,
    handleColorBlindToggle,
    getColor
  } = useAppContext();

  return (
    <View style={[styles.container, { backgroundColor: getColor('background') }]}>
      <Text style={styles.title}>Ajustes</Text>

      <View style={styles.settingOption}>
        <Text style={styles.settingText}>Silenciar Música</Text>
        <Switch value={isMusicMuted} onValueChange={handleMusicToggle} />
      </View>

      <View style={styles.settingOption}>
        <Text style={styles.settingText}>Silenciar Sonidos</Text>
        <Switch value={isSoundMuted} onValueChange={handleSoundToggle} />
      </View>

      <View style={styles.settingOption}>
        <Text style={styles.settingText}>Modo Daltonismo</Text>
        <Switch value={isColorBlindMode} onValueChange={handleColorBlindToggle} />
      </View>

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: getColor('button') }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 50,
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingText: {
    fontSize: 18,
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
