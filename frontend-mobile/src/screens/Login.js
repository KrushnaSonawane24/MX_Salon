import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { api } from '../api';

export default function Login({ onLoggedIn }){
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(){
    setLoading(true); setError('');
    try{
      const r = await api.post('/api/auth/login', { email, password });
      onLoggedIn(r.data.access_token);
    }catch(e){ setError('Invalid credentials'); }
    finally{ setLoading(false); }
  }

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 8 }} />
      <Button title={loading? '...' : 'Login'} onPress={submit} />
      {!!error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
