import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen'; 
import RegisterScreen from '../screens/RegisterScreen'; 
import HomeScreen from '../screens/HomeScreen'; 

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login" // inicia sempre na tela de login
        screenOptions={{
          headerShown: false, // desativa a barra de navegação padrão
          animation: 'fade_from_bottom' // animação
        }}
      >
        {/* rota pra tela de login */}
        <Stack.Screen name="Login" component={LoginScreen} />
        
        {/* rota pra tela de cadastro */}
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* rota pra home */}
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}