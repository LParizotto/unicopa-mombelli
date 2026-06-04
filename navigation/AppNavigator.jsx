import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen'; 
import RegisterScreen from '../screens/RegisterScreen'; 
import HomeScreen from '../screens/HomeScreen'; 
import PalpitesCadastroScreen from '../screens/PalpitesCadastroScreen'; 
import PalpitesRevisaoScreen from '../screens/PalpitesRevisaoScreen';
import PalpitesScreen from '../screens/PalpitesScreen';

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

        {/* rota pra tela de palpites */}
        <Stack.Screen name="Palpites" component={PalpitesCadastroScreen} />

        {/* rota pra tela de revisao de palpites */}
        <Stack.Screen name="Revisao" component={PalpitesRevisaoScreen} />

        {/* rota pra tela de palpites do usuário */}
        <Stack.Screen name="MeusPalpites" component={PalpitesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}