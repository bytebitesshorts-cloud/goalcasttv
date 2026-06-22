import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import ChannelsScreen from './src/screens/ChannelsScreen';
import AdScreen from './src/screens/AdScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import AdBrowserScreen from './src/screens/AdBrowserScreen';
import ScoresScreen from './src/screens/ScoresScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f0f',
          borderTopColor: '#1f1f1f',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#52525b',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Live Matches',
          tabBarIcon: ({ color, size }) => <Ionicons name="football" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Scores"
        component={ScoresScreen}
        options={{
          tabBarLabel: 'Live Scores',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Channels"
        component={ChannelsScreen}
        options={{
          tabBarLabel: 'All Channels',
          tabBarIcon: ({ color, size }) => <Ionicons name="tv" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Ad" component={AdScreen} />
        <Stack.Screen name="Player" component={PlayerScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="AdBrowser" component={AdBrowserScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
