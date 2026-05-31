import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Title, Text } from "react-native-paper";
import { supabase } from "../utils/supabase";

export default function LoginScreen({ navigation }) {
  // setando as consts
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      // validações básicas

      // aqui a data e o error do signWithPassword são desestruturados do objeto que o supa retorna, pra usar somente oq é necessário
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(), // trim() tira os espaços em branco no início e no final do email e password
        password: password,
      });

      // checa a tentativa de login do supa, se der erro lança o catch
      if (error) {
        throw error;
      }

      // deu certo, leva pra HOME
      navigation.replace("Home");
    } catch (error) {
      // mensagens de erros
      let errorMessage = "Não foi possível fazer o login.";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "E-mail ou senha incorretos.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu e-mail antes de entrar.";
      }

      Alert.alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Title style={styles.title}>Unicopa</Title>

        <TextInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          textColor="#E8EDF5"
          theme={{
            colors: {
              onSurfaceVariant: "#8c9fb1",
              primary: "#f2cc2f",
            },
          }}
          left={<TextInput.Icon icon="email" color="#8c9fb1" />}
          disabled={loading}
        />

        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={true}
          style={styles.input}
          textColor="#E8EDF5"
          theme={{
            colors: {
              onSurfaceVariant: "#8c9fb1",
              primary: "#f2cc2f",
            },
          }}
          left={<TextInput.Icon icon="lock" color="#8c9fb1" />}
          disabled={loading}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor="#f2cc2f"
          textColor="#131A25"
        >
          Entrar
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate("Register")}
          disabled={loading}
          textColor="#f2cc2f"
        >
          Não tem uma conta? Cadastre-se
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#0D1520",
  },
  card: {
    backgroundColor: "#131A25",
    padding: 24,
    borderRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#1e2d3d",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#E8EDF5",
  },

  input: {
    marginBottom: 16,
    backgroundColor: "#1C2B3A",
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
});
