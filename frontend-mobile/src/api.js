import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({ baseURL: API_BASE });

export async function setAuthFromStorage(){
  const token = await AsyncStorage.getItem('token');
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
