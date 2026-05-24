import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, ImageBackground,TextInput } from 'react-native';

import Login from "./src/screens/Login.js";
import Cadastro from "./src/screens/Cadastro.js";
import Home from "./src/screens/Home.js";
import CadastroPet from './src/screens/CadastroPet.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="CadastroPet" component={CadastroPet} />

      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}