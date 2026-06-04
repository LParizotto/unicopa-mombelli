import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Text, SegmentedButtons, Appbar, Card } from 'react-native-paper';
import { supabase } from '../utils/supabase';
import { formatarData } from '../utils/DateFormat';

// map da situação
const MAPA_SITUACAO = {
  TOTAL: { texto: 'TOTAL', estilo: 'total' },
  PARCIAL: { texto: 'PARCIAL', estilo: 'parcial' },
  PERDIDIO: { texto: 'PERDIDO', estilo: 'perdido' },
  PENDENTE: { texto: 'PENDENTE', estilo: 'pendente' }
};

export default function PalpitesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  // filtro de palpites (todos, pendentes, confirmados)
  const [filtro, setFiltro] = useState('todos');
  const [dadosAgrupados, setDadosAgrupados] = useState([]);

  useEffect(() => {
    carregarMeusPalpites();
  }, [filtro]);

  const carregarMeusPalpites = async () => {
    try {
      setLoading(true);

      // pega o usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let consulta = supabase
        .from('palpites')
        .select(`
          id, 
          gols_casa, 
          gols_fora, 
          situacao,
          jogos (
            id, 
            grupo, 
            confronto, 
            sigla_casa, 
            sigla_fora, 
            data_brasilia, 
            hora_brasilia, 
            estadio)
        `)
        .eq('id_usuario', user.id);

      // aplica o filtro
      if (filtro === 'pendentes') {
        consulta = consulta.eq('situacao', 'PENDENTE');
      } else if (filtro === 'confirmados') {
        consulta = consulta.in('situacao', ['PERDIDIO', 'PARCIAL', 'TOTAL']);
      }

      const { data, error } = await consulta;
      if (error) throw error;

      setDadosAgrupados(agruparPalpitesPorData(data));
    } catch (error) {
      console.error('Erro ao carregar palpites:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const jogoIniciado = (data, hora) => new Date() >= new Date(`${data} ${hora}`);

  // função pra agrupar os palpites pela data do jogo
  const agruparPalpitesPorData = (listaPalpites) => {
    const grupos = {};

    listaPalpites.forEach((item) => { // percorre a lista de palpites
      if (!item.jogos) return; // se não tiver jogo relacionado só ignora
      const dataFormatada = formatarData(item.jogos.data_brasilia);
      if (!grupos[dataFormatada]) grupos[dataFormatada] = []; // cria um array vazio pro grupo se ainda não existir
      grupos[dataFormatada].push(item); // adiciona o palpite no grupo da data
    });

    // ordena os palpites pela hora do jogo
    return Object.keys(grupos).map((data) => ({
      data,
      palpites: grupos[data].sort((a, b) =>
        a.jogos.hora_brasilia.localeCompare(b.jogos.hora_brasilia) // localeCompare compara as strings
      ),
    }));
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction color="#E8EDF5" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Meus Palpites" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filtro}
          onValueChange={setFiltro}
          theme={{ colors: { secondaryContainer: '#f2cc2f', onSecondaryContainer: '#131A25' } }}
          buttons={[
            { value: 'todos', label: 'Todos', checkedColor: '#131A25', uncheckedColor: '#8c9fb1' },
            { value: 'pendentes', label: 'Pendentes', checkedColor: '#131A25', uncheckedColor: '#8c9fb1' },
            { value: 'confirmados', label: 'Confirmados', checkedColor: '#131A25', uncheckedColor: '#8c9fb1' },
          ]}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#f2cc2f" size="large" />
        </View>
      ) : dadosAgrupados.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.semPalpite}>Nenhum palpite encontrado</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {dadosAgrupados.map((grupo) => (
            <View key={grupo.data} style={styles.dataGrupo}>
              <Text style={styles.data}>{grupo.data}</Text>

              {grupo.palpites.map((item) => {
                const jogo = item.jogos;
                const bloqueado = jogoIniciado(jogo.data_brasilia, jogo.hora_brasilia);
                const status = MAPA_SITUACAO[item.situacao] || { texto: item.situacao };

                return (
                  <View key={item.id} style={[styles.card, bloqueado && styles.cardBloqueado]}>
                    <View>
                      <View style={styles.cardHeader}>
                        <Text style={styles.grupoText}>
                          GRUPO {jogo.grupo} • {jogo.confronto}
                        </Text>
                        <View style={styles.status}>
                          <Text style={[styles.situacao, styles[status.estilo]]}>
                            {status.texto}
                          </Text>
                          {bloqueado && item.situacao === 'PENDENTE' && (
                            <Text style={styles.textoBloqueado}>Em Jogo</Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.partida}>
                        <View style={styles.timeContainer}>
                          <Text style={styles.sigla}>{jogo.sigla_casa}</Text>
                        </View>

                        <View style={styles.placar}>
                          <Text style={styles.placarTexto}>{item.gols_casa}</Text>
                          <Text style={styles.vsText}>X</Text>
                          <Text style={styles.placarTexto}>{item.gols_fora}</Text>
                        </View>

                        <View style={[styles.timeContainer, { alignItems: 'flex-end' }]}>
                          <Text style={styles.sigla}>{jogo.sigla_fora}</Text>
                        </View>
                      </View>

                      <View style={styles.cardFooter}>
                        <Text style={styles.footerText}>
                          {jogo.hora_brasilia ? jogo.hora_brasilia.slice(0, 5) : ''}
                        </Text>
                        <Text style={styles.footerText}>{jogo.estadio}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0D1520' 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  header: {
    backgroundColor: "#131A25",
  },
  headerTitle: {
    color: "#E8EDF5",
    fontWeight: "bold",
  },
  dataGrupo: { 
    marginBottom: 20 
  },
  data: { 
    color: '#f2cc2f', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    marginLeft: 4 
  },
  card: { 
    backgroundColor: '#131A25', 
    marginBottom: 12, 
    borderRadius: 12, 
    padding: 16
  },
  cardBloqueado: { 
    opacity: 0.8, 
    borderWidth: 1, 
    borderColor: '#1e2d3d' 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12,
  },
  grupoText: { 
    color: '#8c9fb1', 
    fontSize: 11 
  },
  status: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  textoBloqueado: { 
    color: '#8c9fb1', 
    fontSize: 11, 
    fontWeight: 'bold' 
  },
  situacao: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4 
  },
  partida: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginVertical: 4 
  },
  timeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  sigla: { 
    color: '#E8EDF5', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  placar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14, 
    backgroundColor: '#1C2B3A', 
    paddingVertical: 6, 
    paddingHorizontal: 18, 
    borderRadius: 8 
  },
  placarTexto: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  vsText: { 
    color: '#f2cc2f', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 12, 
    borderColor: '#1e2d3d', 
    paddingTop: 8 
  },
  footerText: { 
    color: '#8c9fb1', 
    fontSize: 11 
  },
  semPalpite: { 
    color: '#8c9fb1', 
    fontSize: 16, 
    textAlign: 'center' 
  },
  total: { 
    backgroundColor: '#27ae60', 
    color: '#fff' 
  },
  parcial: { 
    backgroundColor: '#f39c12', 
    color: '#fff'
  },
  perdido: { 
    backgroundColor: '#e74c3c',
    color: '#fff'
   },
  pendente: { 
    backgroundColor: '#7f8c8d', 
    color: '#fff'

  }
});