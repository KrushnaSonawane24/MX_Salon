import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { api } from '../api';
import { socket, joinSalonRoom } from '../socket';

export default function Queue(){
  const [salonId, setSalonId] = useState('');
  const [userId, setUserId] = useState('demoUser');
  const [queue, setQueue] = useState([]);

  useEffect(()=>{
    const handler = (data)=>{ if(data?.salon_id === salonId) setQueue(data.queue); };
    socket.on('queue:update', handler);
    return ()=>{ socket.off('queue:update', handler); };
  }, [salonId]);

  async function load(){
    if(!salonId) return;
    const r = await api.get(`/api/queue/${salonId}`);
    setQueue(r.data.queue);
    joinSalonRoom(salonId);
  }

  async function join(){ await api.post(`/api/queue/join/${salonId}`, null, { params: { user_id: userId }}); }
  async function leave(){ await api.post(`/api/queue/leave/${salonId}`, null, { params: { user_id: userId }}); }

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Queue</Text>
      <TextInput placeholder="Salon ID" value={salonId} onChangeText={setSalonId} style={{ borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="User ID" value={userId} onChangeText={setUserId} style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Load" onPress={load} />
      <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
        <Button title="Join" onPress={join} />
        <Button title="Leave" onPress={leave} />
      </View>
      <Text>Current Queue:</Text>
      <FlatList data={queue} keyExtractor={(i,idx)=>i+idx} renderItem={({item, index})=> (
        <Text>{index+1}. {item}</Text>
      )} />
    </View>
  );
}
