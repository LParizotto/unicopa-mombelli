import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Button, TextInput, ActivityIndicator, Appbar } from "react-native-paper";
import { supabase } from "../utils/supabase";

export default function PalpitesCadastroScreen({ navigation }) {
  const [jogos, setJogos] = useState([]);
  const [palpites, setPalpites] = useState({});
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    setLoading(true);

    // pega o usuário logado
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUsuario(user);

    // pega os jogos para exibir
    const { data: jogos } = await supabase
      .from("jogos")
      .select("*")
      .order("data_brasilia", { ascending: true });

    // pega os palpites do usuario
    const { data: meusPalpites } = await supabase
      .from("palpites")
      .select("*")
      .eq("id_usuario", user.id);

    const palpitesMapeados = {}; // objeto vazio para guardar o resultado final
    meusPalpites.forEach((palpite) => {
      // vê a lista que veio do banco palpite por palpite
      palpitesMapeados[palpite.id_jogo] = {
        gols_casa: palpite.gols_casa?.toString() || "", // transforma em STRING - "?." aceita caso venha nulo - "" se o valor vier nulo coloca uma string vazia (seria o 0)
        gols_fora: palpite.gols_fora?.toString() || "",
        confirmado: palpite.confirmado,
      };
    });

    setJogos(jogos);
    setPalpites(palpitesMapeados);
    setLoading(false);
  };

  const jogoBloqueado = (jogo) => {
    const agora = new Date(); // pega o dia e a data de agora
    const inicioJogo = new Date(`${jogo.data_brasilia} ${jogo.hora_brasilia}`); // pega o dia e a data do jogo
    return agora >= inicioJogo; // compara
  };

  const atualizarPlacar = (idJogo, campo, valor) => {
    setPalpites((prev) => ({ // pega o estado anterior
      ...prev,
      [idJogo]: { // entra no jogo que mudou 
        ...prev[idJogo], // copia os dados que já existem dentro do jogo
        [campo]: valor, // atualiza apenas o campo que mudou (gols_casa ou gols_fora)
      },
    }));
  };

  const irParaRevisao = () => {
    // pega apenas os dados dos palpites e faz a busca
    const temPalpiteNovo = Object.values(palpites).some(
      (palpite) => palpite.gols_casa !== "" && palpite.gols_fora !== "" && !palpite.confirmado,
    );

    // alerta caso false
    if (!temPalpiteNovo) {
      Alert.alert("Preencha pelo menos um palpite novo para revisar.");
      return;
    }

    // manda pra tela de revisão caso true
    navigation.navigate("PalpitesRevisao", { palpites, jogos });
  };

  if (loading)
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#f2cc2f" size="large" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          color="#E8EDF5"
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content title="Registrar Palpites" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {/* lista dos jogos */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {jogos.map((jogo) => {
          const bloqueado = jogoBloqueado(jogo);
          const palpite = palpites[jogo.id] || {};

          return (
            <View key={jogo.id} style={[styles.card, bloqueado && styles.cardBloqueado]}>
              <View style={styles.cardHeader}>
                <Text style={styles.grupoText}>
                  GRUPO {jogo.grupo} • {jogo.confronto}
                </Text>
                {bloqueado && <Text style={styles.lockText}>🔒 Bloqueado</Text>}
              </View>

              <View style={styles.row}>
                <Text style={styles.sigla}>{jogo.sigla_casa}</Text>

                <View style={styles.inputsRow}>
                  <TextInput
                    mode="outlined"
                    style={styles.input}
                    value={palpite.gols_casa || ""}
                    onChangeText={(val) =>
                      atualizarPlacar(jogo.id, "gols_casa", val)
                    }
                    disabled={bloqueado} // desativa o input caso jogo seja bloqueado
                    theme={{ colors: { primary: "#f2cc2f" } }}
                  />
                  <Text style={styles.vs}>X</Text>
                  <TextInput
                    mode="outlined"
                    style={styles.input}
                    value={palpite.gols_fora || ""}
                    onChangeText={(val) =>
                      atualizarPlacar(jogo.id, "gols_fora", val)
                    }
                    disabled={bloqueado} // desativa o input caso jogo seja bloqueado
                    theme={{ colors: { primary: "#f2cc2f" } }}
                  />
                </View>

                <Text style={[styles.sigla, { textAlign: "right" }]}>
                  {jogo.sigla_fora}
                </Text>
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
          onPress={irParaRevisao}
          style={{ paddingVertical: 4 }}
        >
          Revisar Palpites
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0D1520" 
  },
  center: { 
    justifyContent: "center", 
    alignItems: "center" 
  },
  header: { 
    backgroundColor: "#131A25" 
  },
  headerTitle: { 
    color: "#E8EDF5", 
    fontWeight: "bold" 
  },
  card: {
    backgroundColor: "#131A25",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardBloqueado: { 
    borderWidth: 1, 
    borderColor: "#e74c3c", 
    opacity: 0.7 
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  grupoText: { 
    color: "#8c9fb1", 
    fontSize: 12 
  },
  lockText: { 
    color: "#e74c3c", 
    fontSize: 12, 
    fontWeight: "bold" 
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sigla: { 
    color: "#E8EDF5", 
    fontWeight: "bold", 
    fontSize: 16, 
    width: "20%" 
  },
  inputsRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10 
  },
  input: {
    backgroundColor: "#1C2B3A",
    width: 45,
    height: 40,
    textAlign: "center",
  },
  vs: { 
    color: "#f2cc2f", 
    fontWeight: "bold" 
  },
  footer: {
    backgroundColor: "#131A25",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#1e2d3d",
  },
});
