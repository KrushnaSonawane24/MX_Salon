import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { api } from '../api';

export default function Home(){
  const [salons, setSalons] = useState([]);
  useEffect(()=>{ (async()=>{
    try{ const r = await api.get('/api/salons'); setSalons(r.data); }catch{}
  })() },[]);

  return (
    <FlatList
      data={salons}
      keyExtractor={(item)=>item.id}
      renderItem={({item})=> (
        <View style={{ padding: 16, borderBottomWidth: 1 }}>
          <Text style={{ fontWeight: '600' }}>{item.name}</Text>
          <Text>{item.city}</Text>
          <Text>Rating: {item.rating ?? 0}</Text>
        </View>
      )}
    />
  );
}
