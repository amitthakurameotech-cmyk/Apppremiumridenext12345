import { COLORS } from '@/styles/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Tablayout() {
  return (
    <Tabs
        screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.grey,
            tabBarStyle:{
                backgroundColor:"white",
                borderTopWidth:0,
                position:'absolute',
                elevation:0,
                height:60,
                paddingBottom:8,

            }
           
        }}
    >
       
        <Tabs.Screen name="index" options={{ tabBarIcon : ({size,color})=><Ionicons name="home" size={size} color={color}/>}}/>
        <Tabs.Screen name="PostRide" options={{ tabBarIcon : ({size,color})=><Ionicons name="send" size={size} color={color}/>}}/>
        <Tabs.Screen name="SearchRide"options={{ tabBarIcon : ({size,color})=><Ionicons name="search" size={size} color={color}/>}}/>
        <Tabs.Screen name="MyBooking"options={{ tabBarIcon : ({size,color})=><Ionicons name="book" size={size} color={color}/>}}/>
        <Tabs.Screen name="Profile" options={{ tabBarIcon : ({size,color})=><Ionicons name="person" size={size} color={color}/>}}/>
    </Tabs>
  )
}