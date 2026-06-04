import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Image, ImageBackground, SectionList, View } from 'react-native';
import { formatarData } from '../utils/DateFormat';
import DiaCard from '../components/DiaCard';       
import { supabase } from '../utils/supabase';     
import { Button } from 'react-native-paper';
import PalpitesCadastroScreen from '../screens/PalpitesCadastroScreen'; 
import PalpitesScreen from '../screens/PalpitesScreen';

export default function HomeScreen( { navigation } ) {
  const [jogos, setJogos] = useState([]);

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

  const agruparPorData = (jogos) => {
    return jogos.reduce((acc, jogo) => {
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

  const jogosAgrupados = agruparPorData(jogos);

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

      <SectionList
        sections={jogosTratados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={() => null}
        renderSectionHeader={({ section }) => (
          <DiaCard data={section.title} jogos={section.data} />
        )}
      />

    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
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
});