import React, { useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { IconButton } from 'react-native-paper';
import { TEAM_FLAGS } from '../utils/flagMapping';
import { supabase } from '../utils/supabase';

export default function GameCard({ game }) {
    const [isFavorited, setIsFavorited] = useState(false);

    const timeCasa = TEAM_FLAGS[game.sigla_casa];
    const timeFora = TEAM_FLAGS[game.sigla_fora];

    const jogoBrasil = game.sigla_casa === 'BRA' || game.sigla_fora === 'BRA';
    const semTimesDefinidos = !timeCasa || !timeFora;

    const toggleFavorite = async () => {
        const previousState = isFavorited;

        setIsFavorited(!previousState);

        try {
            if (!previousState) {
                const { error } = await supabase
                    .from('favoritos')
                    .insert([
                        {
                            id_usuario: idDoUsuarioLogado,
                            id_jogo: idDoJogoAtual
                        }
                    ]);

                if (error) throw error;

            } else {
                const { error } = await supabase
                    .from('favoritos')
                    .delete()
                    // .eq('id_usuario', idDoUsuarioLogado) ainda não criei a parte de login do usuário 
                    // .eq('id_jogo', idDoJogoAtual); msm coisa 

                if (error) throw error;
            }

        } catch (error) {   
            console.error('Erro ao atualizar favorito:', error.message);
            setIsFavorited(previousState);
            alert('Não foi possível salvar seu favorito. Tente novamente.');
        }
    };

    if (semTimesDefinidos) {
        return (
            <View style={styles.jogo}>
                <View style={styles.topoCard}>
                    <Text style={styles.grupo}>
                        GRUPO {game.grupo}  {game.confronto}
                    </Text>
                    <IconButton
                        icon={isFavorited ? 'heart' : 'heart-outline'}
                        iconColor={isFavorited ? '#ee2c3c' : '#8fa3b8'}
                        size={20}
                        style={styles.botaoFavorito}
                        onPress={toggleFavorite}
                    />
                </View>
                <Text style={styles.subTitulo}>A definir...</Text>
            </View>
        );
    }

    return (
        <View style={jogoBrasil ? styles.brasil : styles.jogo}>

            <View style={styles.topoCard}>
                <Text style={styles.grupo}>
                    GRUPO {game.grupo}  {game.confronto}
                </Text>

                <IconButton
                    icon={isFavorited ? 'heart' : 'heart-outline'}
                    iconColor={isFavorited ? '#ee2c3c' : '#8fa3b8'}
                    size={20}
                    style={styles.botaoFavorito}
                    onPress={toggleFavorite}
                />
            </View>

            <View style={styles.linhaPrincipal}>

                <View style={styles.time}>
                    {timeCasa && <Image source={timeCasa} style={styles.bandeira} />}
                    <Text style={styles.sigla}>{game.sigla_casa}</Text>
                </View>

                <View style={styles.horario}>
                    <Text style={styles.hora}>
                        {game.hora_brasilia ? game.hora_brasilia.slice(0, 5) : ''}
                    </Text>
                    <Text style={styles.subTitulo}>VS</Text>
                </View>

                <View style={styles.time}>
                    {timeFora && <Image source={timeFora} style={styles.bandeira} />}
                    <Text style={styles.sigla}>{game.sigla_fora}</Text>
                </View>

            </View>

            <View style={styles.local}>
                <Text style={styles.subTitulo}>{game.estadio}</Text>
                <Text style={styles.subTitulo}>
                    {game.cidade} • {game.pais}
                </Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    jogo: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1e2d3d',
        paddingBottom: 15
    },
    brasil: {
        borderColor: '#f5f114',
        marginBottom: 20,
        borderLeftWidth: 1,
        borderTopWidth: 1,
        borderRadius: 5,
        padding: 10,
    },
    topoCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    botaoFavorito: {
        margin: 0,
        padding: 0,
    },
    grupo: {
        color: '#8fa3b8',
        fontSize: 12,
    },
    linhaPrincipal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    time: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    bandeira: {
        width: 28,
        height: 28,
        borderRadius: 14
    },
    sigla: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    horario: {
        alignItems: 'center'
    },
    hora: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    local: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    subTitulo: {
        color: '#8fa3b8',
        fontSize: 12
    }
});