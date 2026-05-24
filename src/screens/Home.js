import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  ImageBackground, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Platform,
  ActivityIndicator // Adicionado para mostrar um carregando elegante
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Importações do Firebase
import { db, auth } from "../firebase/config"; 
import { collection, getDocs } from "firebase/firestore";

export default function Home({ navigation }) {
  // Estados para gerenciar os dados e o carregamento
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarPetsDoUsuario = async () => {
      try {
        // 1. Pega o usuário que está logado no momento
        const usuarioAtual = auth.currentUser;

        if (usuarioAtual) {
          const uid = usuarioAtual.uid;

          // 2. Aponta exatamente para a subcoleção onde os pets foram salvos
          const petsRef = collection(db, "usuarios", uid, "pets");
          const querySnapshot = await getDocs(petsRef);
          
          const listaPets = [];
          querySnapshot.forEach((doc) => {
            // Mapeia o id do documento + dados do pet
            listaPets.push({ id: doc.id, ...doc.data() });
          });

          // 3. Salva no estado
          setPets(listaPets);
        } else {
          console.log("Nenhum usuário logado");
          // Opcional: Redirecionar para tela de Login caso não encontre sessão
           navigation.navigate('Login');
        }
      } catch (error) {
        console.error("Erro ao buscar os pets: ", error);
      } finally {
        setLoading(false); // Desativa o indicador de carregamento
      }
    };

    buscarPetsDoUsuario();
  }, []); // Executa ao abrir a tela

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/background4.png')}
        resizeMode="cover"
        style={styles.image}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headerText}>Meus Pets</Text>

          {/* 1. Enquanto busca os dados no Firebase, mostra o Carregando */}
          {loading ? (
            <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 20 }} />
          ) : pets.length === 0 ? (
            /* 2. Caso a lista volte vazia (usuário sem pets cadastrados) */
            <Text style={styles.emptyText}>Você ainda não cadastrou nenhum pet. 🐾</Text>
          ) : (
            /* 3. Renderiza a lista se houver itens */
            pets.map((pet) => (
              <TouchableOpacity 
                key={pet.id} 
                style={styles.petCard}
                activeOpacity={0.8}
              >
                {/* Fallback de imagem caso não tenha foto salva no banco */}
                <Image 
                  source={{ uri: pet.foto || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=150&auto=format&fit=crop' }} 
                  style={styles.petAvatar} 
                />
                
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.nome}</Text>
                  <Text style={styles.petDetail}>
                    <Text style={styles.boldLabel}>Raça:</Text> {pet.raca}
                  </Text>
                  <Text style={styles.petDetail}>
                    <Text style={styles.boldLabel}>Espécie:</Text> {pet.especie}
                  </Text>
                  {/* Detalhe extra opcional (já que você salva no banco): */}
                  <Text style={styles.petDetail}>
                    <Text style={styles.boldLabel}>Sexo:</Text> {pet.sexo === 'macho' ? 'Macho' : 'Fêmea'}
                  </Text>
                  <Text style={styles.petDetail}>
                    <Text style={styles.boldLabel}>Castrado:</Text> {pet.castrado === 'sim' ? 'Sim' : 'Não'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Botão de Adicionar Novo Pet */}
          <TouchableOpacity 
            style={styles.addPetButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CadastroPet') }
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={36} color="#083068" />
            <Text style={styles.addPetText}>ADICIONAR NOVO PET</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Global Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.6}>
            <MaterialCommunityIcons name="paw" size={32} color="#4A90E2" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} activeOpacity={0.6}>
            <FontAwesome5 name="map-marked-alt" size={28} color="#A0AEC0" />
          </TouchableOpacity>
        </View>

        <StatusBar style="auto" />
      </ImageBackground>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 100, // Keeps cards from slipping under the navbar
  },
  headerText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#083068',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    // Elegant soft shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  petAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#CBD5E0',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  petInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    textDecorationLine: 'underline', // Kept from your wireframe concept
    marginBottom: 4,
  },
  petDetail: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 2,
  },
  boldLabel: {
    fontWeight: '600',
    color: '#2D3748',
  },
  addPetButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 2,
    borderColor: '#083068',
    borderStyle: 'dashed', // Changes button style to a smart actionable element
    borderRadius: 18,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  addPetText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#083068',
    letterSpacing: 0.5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 15 : 0, // Extra cushion for iOS home indicators
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 10,
  },
  navItem: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }
});