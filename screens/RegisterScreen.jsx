import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { TextInput, Button, Title } from "react-native-paper";
import { supabase } from "../utils/supabase";

export default function RegisterScreen({ navigation }) {
  // setando as consts
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleRegister = async () => {
    setEmailError(false);
    setPasswordError(false);

    // validações
    if (!email || !password || !confirmPassword) {
      Alert.alert(
        "Erro",
        "Por favor, preencha E-mail, Senha e Confirmação de Senha.",
      );
      return;
    }

    // ve se é um email (se tem o "@")
    if (!email.includes("@")) {
      setEmailError(true);
      return;
    }

    // tamanho mínimo da senha tem que ser 6 caracteres
    if (password.length < 6) {
      setPasswordError(true);
      Alert.alert("Senha curta", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    // se a senha e confirmar senha forem diferentes
    if (password !== confirmPassword) {
      Alert.alert("Erro", "A senha e a confirmação de senha não coincidem.");
      return;
    }

    setLoading(true);

    // tenta criar a conta no supabase
    try {
      const { data, error } = await supabase.auth.signUp({
        // trim() tira os espaços em branco no início e no final do email e nome
        email: email.trim(),
        password: password,
        options: {
          data: {
            display_name: name.trim() || null,
          },
        },
      });

      // se der erro lança o catch
      if (error) throw error;

      // se o cadastro der boa, verifica se o email precisa ser confirmado
      if (data?.user && data?.session === null) {
        Alert.alert(
          "Cadastro realizado!",
          "Enviamos um e-mail de confirmação. Verifique sua caixa de entrada antes de fazer o login.",
          [{
              text: "Ir para o Login",
              onPress: () => navigation.navigate("Login"),
            },
          ],
        );
      } else {
        Alert.alert("Sucesso!", "Sua conta foi criada com sucesso.", [
          { text: "Ok", onPress: () => navigation.navigate("Login") },
        ]);
      }
    } catch (error) {
      Alert.alert(
        "Erro no Cadastro",
        error.message || "Não foi possível criar a conta.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Title style={styles.title}>Criar Conta</Title>

          <TextInput
            label="Nome (Opcional)"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" color="#ffffff"/>}
            disabled={loading}
            textColor="#E8EDF5"
            theme={{
              colors: {
                onSurfaceVariant: "#ffffff",
                primary: "#f2cc2f",
              },
            }}
          />

          <TextInput
            label="E-mail *"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            error={emailError}
            left={<TextInput.Icon icon="email" color="#ffffff"/>}
            disabled={loading}
            textColor="#E8EDF5"
            theme={{
              colors: {
                onSurfaceVariant: "#ffffff",
                primary: "#f2cc2f",
              },
            }}
          />

          <TextInput
            label="Senha *"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={true} // esconde a senha 
            style={styles.input}
            error={passwordError}
            left={<TextInput.Icon icon="lock" color="#ffffff"/>}
            disabled={loading}
            textColor="#E8EDF5"
            theme={{
              colors: {
                onSurfaceVariant: "#ffffff",
                primary: "#f2cc2f",
              },
            }}
          />

          <TextInput
            label="Confirmar Senha *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={true} // esconde a senha
            style={styles.input}
            left={<TextInput.Icon icon="lock" color="#ffffff"/>}
            disabled={loading}
            textColor="#E8EDF5"
            theme={{
              colors: {
                onSurfaceVariant: "#ffffff",
                primary: "#f2cc2f",
              },
            }}
          />

          <Button
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor="#f2cc2f"
            textColor="#131A25"
          >
            Cadastrar
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("Login")}
            disabled={loading}
            textColor="#f2cc2f"
          >
            Já tem uma conta? Faça Login
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1520",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#131A25",
    padding: 24,
    borderRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#1E2E40",
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
