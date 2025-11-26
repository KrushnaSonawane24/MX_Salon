import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Queue from '../screens/Queue';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function Tabs(){
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Queue" component={Queue} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
