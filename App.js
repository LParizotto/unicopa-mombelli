import { StyleSheet, Text, Image, ImageBackground, SectionList } from 'react-native';
import { formatarData } from './utils/DateFormat';
import DiaCard from './components/DiaCard';
import { supabase } from './utils/supabase';
import { useEffect, useState } from 'react';

export default function App() {

  const [jogos, setJogos] = useState([])

  useEffect(() => {
    async function carregarJogos(){

      const { data, error } = await supabase
        .from('jogos')
        .select('*')
        .order('data_brasilia', { ascending: true })

      if(!error){
        setJogos(data)
      }

    }

    carregarJogos()

    async function inserirUsuario() {
      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          nome: 'Luís Fernando ',
          email: 'luis.fernando@example.com',
          senha: 'senha123',
          telefone: '46999999999',
          data_nascimento: '2000-01-01',
          ra: '123456',

          nome: 'João Silva',
          email: 'joao.silva@example.com',
          senha: 'senha123',
          telefone: '46999999999',
          data_nascimento: '2000-01-01',
          ra: '123457',
        })

      if (!error) {
        console.log('Usuário inserido com sucesso: ', data);
      } else {
        console.error('Erro ao inserir usuário: ', error);
      }
    }

    inserirUsuario();

  }, [])
  
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
      }

      acc[data].sort(ordenacaoHorario);

      return acc;

    }, {});
  }

  const jogosAgrupados = agruparPorData(jogos);

  const jogosTratados = Object.keys(jogosAgrupados).map(data => {
    return {
      title: data,
      data: jogosAgrupados[data]
    }
  });

  return (
    <ImageBackground style={styles.container}
      source={require('./assets/bg-overlay.png')}>
      <Image style={styles.logo}
        source={require('./assets/unicopa.png')}
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
    marginTop: 20,
    width: 200,
    height: 50,
    resizeMode: 'contain'
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  card: {
    marginTop: 20,
    backgroundColor: '#0c1b2a',
    width: 320,
    borderRadius: 12,
    padding: 15,
  },
  data: {
    color: '#f2cc2f',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
});