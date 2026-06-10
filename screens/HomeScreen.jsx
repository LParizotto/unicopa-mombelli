import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Image, ImageBackground, SectionList, View, ScrollView, TouchableOpacity } from 'react-native';
import { formatarData } from '../utils/DateFormat';
import DiaCard from '../components/DiaCard';       
import { supabase } from '../utils/supabase';     
import { Button } from 'react-native-paper';

export default function HomeScreen( { navigation } ) {
  const [jogos, setJogos] = useState([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState('Todos');

  const listaGrupos = ['Todos', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  useEffect(() => {
    async function carregarJogos() {
      const { data, error } = await supabase
        .from('jogos')
        .select('*')
        .order('data_brasilia', { ascending: true });

      if (!error) {
        setJogos(data);
      }
    }

    carregarJogos();
  }, []);

  const agruparPorData = (jogosParaAgrupar) => {
    return jogosParaAgrupar.reduce((acc, jogo) => {
      const data = formatarData(jogo.data_brasilia);

      if (!acc[data]) {
        acc[data] = [];
      }

      acc[data].push(jogo);

      const ordenacaoHorario = (a, b) => {
        const horaA = a.hora_brasilia.split(':').map(Number);
        const horaB = b.hora_brasilia.split(':').map(Number);
        return horaA[0] - horaB[0] || horaA[1] - horaB[1];
      };

      acc[data].sort(ordenacaoHorario);
      return acc;
    }, {});
  };

  const jogosFiltrados = grupoSelecionado === 'Todos'
    ? jogos
    : jogos.filter(jogo => jogo.grupo === grupoSelecionado);

  const jogosAgrupados = agruparPorData(jogosFiltrados);

  const jogosTratados = Object.keys(jogosAgrupados).map((data) => {
    return {
      title: data,
      data: jogosAgrupados[data],
    };
  });

  return (
    <ImageBackground
      style={styles.container}
      source={require('../assets/bg-overlay.png')} 
    >
      <Image
        style={styles.logo}
        source={require('../assets/unicopa.png')} 
      />

      <Text style={styles.title}>CALENDÁRIO</Text>

      <View style={styles.containerFiltro}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollFiltro}>
          {listaGrupos.map((grupo) => (
            <TouchableOpacity
              key={grupo}
              style={[
                styles.botaoFiltro,
                grupoSelecionado === grupo && styles.botaoAtivo
              ]}
              onPress={() => setGrupoSelecionado(grupo)}
            >
              <Text style={[
                styles.textoFiltro,
                grupoSelecionado === grupo && styles.textoAtivo
              ]}>
                {grupo === 'Todos' ? 'Todos' : `Grupo ${grupo}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <SectionList
        sections={jogosTratados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={() => null}
        renderSectionHeader={({ section }) => (
          <DiaCard data={section.title} jogos={section.data} />
        )}
        style={styles.lista}
        ListEmptyComponent={
          <Text style={styles.listaVazia}>Nenhum jogo para o Grupo {grupoSelecionado}.</Text>
        }
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <Button
          mode="contained"
          buttonColor="#f2cc2f"
          textColor="#131A25"
          onPress={() => navigation.navigate('Palpites')}
          style={{ marginVertical: 10 }}
        >
          Fazer Palpites
        </Button>
        <Button
          mode="contained"
          buttonColor="#f2cc2f"
          textColor="#131A25"
          onPress={() => navigation.navigate('MeusPalpites')}
          style={{ marginVertical: 10 }}
        >
          Meus Palpites
        </Button>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#040b13',
    alignItems: 'center',
  },
  logo: {
    marginTop: 60,
    width: 200,
    height: 50,
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  lista: {
    width: '100%',
    paddingHorizontal: 16,
  },
containerFiltro: {
    width: '100%',
    height: 50,
    marginTop: 15,
    marginBottom: 10,
  },
  scrollFiltro: {
    paddingHorizontal: 16, 
    gap: 10,
    alignItems: 'center', 
  },
  botaoFiltro: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#131A25',
    borderWidth: 1,
    borderColor: '#1e2d3d',
  },
  botaoAtivo: {
    backgroundColor: '#f2cc2f', 
    borderColor: '#f2cc2f',
  },
  textoFiltro: {
    color: '#8fa3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  textoAtivo: {
    color: '#131A25', 
  },
  listaVazia: {
    color: '#8fa3b8',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  }
});