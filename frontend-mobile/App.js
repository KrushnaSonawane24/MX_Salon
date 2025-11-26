import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Tabs from './src/navigation/Tabs';
import Login from './src/screens/Login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './src/i18n';

export default function App() {
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('token');
      setToken(t);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <NavigationContainer>
      {token ? (
        <Tabs />
      ) : (
        <Login onLoggedIn={async (t) => { await AsyncStorage.setItem('token', t); setToken(t); }} />
      )}
    </NavigationContainer>
  );
}
