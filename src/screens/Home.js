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
  ActivityIndicator,
  Alert 
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Importações do Firebase
import { db, auth } from "../firebase/config"; 
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"; // Added doc and deleteDoc
import { signOut } from "firebase/auth"; 

export default function Home({ navigation }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const deslogarUsuario = () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair do PetSuam?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace('Login'); 
            } catch (error) {
              Alert.alert("Erro ao sair", "Não foi possível encerrar a sessão: " + error.message);
            }
          } 
        }
      ]
    );
  };

  // NEW FUNCTION: Handles native document deletion from nested subcollection paths
  const deletarPet = (idPet, nomePet) => {
    Alert.alert(
      "Excluir Pet 🐾",
      `Tem certeza que deseja remover o(a) ${nomePet} permanentemente?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const uid = auth.currentUser?.uid;
              if (!uid) return;

              // Targets the specific path reference to the single pet document
              const petDocRef = doc(db, "usuarios", uid, "pets", idPet);
              await deleteDoc(petDocRef);

              // Smoothly filters out the deleted pet from state to update layout instantly
              setPets((prevPets) => prevPets.filter(pet => pet.id !== idPet));
              
              Alert.alert("Sucesso", `${nomePet} foi removido com sucesso.`);
            } catch (error) {
              Alert.alert("Erro ao deletar", "Não foi possível remover o pet: " + error.message);
            }
          }
        }
      ]
    );
  };

  const buscarPetsDoUsuario = async () => {
    try {
      const usuarioAtual = auth.currentUser;

      if (usuarioAtual) {
        const uid = usuarioAtual.uid;

        const petsRef = collection(db, "usuarios", uid, "pets");
        const querySnapshot = await getDocs(petsRef);
        
        const listaPets = [];
        querySnapshot.forEach((doc) => {
          listaPets.push({ id: doc.id, ...doc.data() });
        });

        setPets(listaPets);
      } else {
        console.log("Nenhum usuário logado");
        navigation.replace('Login');
      }
    } catch (error) {
      console.error("Erro ao buscar os pets: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch data on screen load or refocus
  useEffect(() => {
    buscarPetsDoUsuario();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/Fundo-petsuam.jpeg')}
        resizeMode="cover"
        style={styles.image}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Meus Pets</Text>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={deslogarUsuario}
              activeOpacity={0.6}
            >
              <MaterialCommunityIcons name="logout" size={26} color="#E53E3E" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 20 }} />
          ) : pets.length === 0 ? (
            <Text style={styles.emptyText}>Você ainda não cadastrou nenhum pet. 🐾</Text>
          ) : (
            pets.map((pet) => (
              <TouchableOpacity 
                key={pet.id} 
                style={styles.petCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PerfilPet', { petSelecionado: pet })}
              >
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
                  <Text style={styles.petDetail}>
                    <Text style={styles.boldLabel}>Sexo:</Text> {pet.sexo === 'macho' ? 'Macho' : 'Fêmea'}
                  </Text>
                  <Text style={styles.petDetail}>
                    <Text style={styles.boldLabel}>Castrado:</Text> {pet.castrado === 'sim' ? 'Sim' : 'Não'}
                  </Text>
                </View>

                {/* MODIFIED: Trash icon button explicitly separated inside card interface */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deletarPet(pet.id, pet.nome)}
                  activeOpacity={0.6}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={24} color="#E53E3E" />
                </TouchableOpacity>

              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity 
            style={styles.addPetButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CadastroPet') }
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={36} color="#083068" />
            <Text style={styles.addPetText}>ADICIONAR NOVO PET</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.6}>
            <MaterialCommunityIcons name="paw" size={32} color="#4A90E2" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => navigation.navigate('MapScreen')}>
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
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#083068',
    letterSpacing: 0.5,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 235, 235, 0.9)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  emptyText: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 16,
    marginVertical: 20,
    fontStyle: 'italic',
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
    textDecorationLine: 'underline',
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
  // NEW STYLE: Positions the trash icon perfectly on the right-hand edge of the card
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 215, 215, 0.4)',
    borderRadius: 10,
    marginLeft: 8
  },
  addPetButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 2,
    borderColor: '#083068',
    borderStyle: 'dashed',
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
    paddingBottom: Platform.OS === 'ios' ? 15 : 0,
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