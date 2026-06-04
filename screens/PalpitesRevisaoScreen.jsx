import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Button, ActivityIndicator, Appbar, Card } from "react-native-paper";
import { supabase } from "../utils/supabase";

export default function PalpitesRevisaoScreen({ route, navigation }) {
  // pega os palpites e jogos da tela anterior
  const { palpites, jogos } = route.params;
  const [loading, setLoading] = useState(false);

  // pega apenas os jogos que tem palpites preenchidos mas não foram confirmados
  const jogosParaRevisar = jogos.filter((jogo) => {
    const palpite = palpites[jogo.id];
    return (
      palpite && palpite.gols_casa !== "" && palpite.gols_fora !== "" && !palpite.confirmado
    );
  });

  const salvarPalpites = async () => {
    setLoading(true);

    try {
      // pega o usuário logado
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      // mapeia os palpites para o banco
      const dadosPalpites = jogosParaRevisar.map((jogo) => ({
        id_jogo: jogo.id,
        id_usuario: user.id,
        gols_casa: parseInt(palpites[jogo.id].gols_casa, 10), // converte string para int4
        gols_fora: parseInt(palpites[jogo.id].gols_fora, 10), // converte string para int4
        situacao: "PENDENTE", // valor pro ENUM
      }));

      const { error } = await supabase
        // salva ou atualiza os palpites no banco
        .from("palpites")
        .upsert(dadosPalpites, // esse upsert que insere ou atualiza os valores (ele é do supa)
        { onConflict: "id_usuario,id_jogo" }); // onConflict serve se já tiver um palpite pro usuário ele atualiza, e não gera um novo

      if (error) throw error;

      Alert.alert("Deu boa", "Seus palpites foram registrados com sucesso.", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível salvar os palpites: " + error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          color="#E8EDF5"
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content
          title="Revisar Palpites"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {jogosParaRevisar.map((jogo) => {
          const palpite = palpites[jogo.id];

          return (
            <View key={jogo.id} style={styles.card}>
              <View>
                <Text style={styles.grupoText}>
                  GRUPO {jogo.grupo} - {jogo.confronto}
                </Text>

                <View style={styles.row}>
                  <View style={styles.teamContainer}>
                    <Text style={styles.sigla}>{jogo.sigla_casa}</Text>
                  </View>

                  <View style={styles.placarContainer}>
                    <Text style={styles.gols}>{palpite.gols_casa}</Text>
                    <Text style={styles.vs}>X</Text>
                    <Text style={styles.gols}>{palpite.gols_fora}</Text>
                  </View>

                  <View
                    style={[styles.teamContainer, { alignItems: "flex-end" }]}
                  >
                    <Text style={styles.sigla}>{jogo.sigla_fora}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          buttonColor="#f2cc2f"
          textColor="#131A25"
          onPress={salvarPalpites}
          style={{ paddingVertical: 4 }}
        >
          Confirmar e Salvar
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1520",
  },
  header: {
    backgroundColor: "#131A25",
  },
  headerTitle: {
    color: "#E8EDF5",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#131A25",
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  grupoText: {
    color: "#8c9fb1",
    fontSize: 11,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamContainer: {
    width: "30%",
  },
  sigla: {
    color: "#E8EDF5",
    fontWeight: "bold",
    fontSize: 18,
  },
  placarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1C2B3A",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  gols: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  vs: {
    color: "#f2cc2f",
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    backgroundColor: "#131A25",
    padding: 16,
  },
});
