import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal, 
  FlatList 
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// Importações do Firebase atualizadas para buscar dados do Tutor
import { db, auth } from "../firebase/config";
import { collection, addDoc, getDocs, doc, getDoc, serverTimestamp } from "firebase/firestore";

export default function PerfilPet({ route, navigation }) {
  
  const { petSelecionado } = route.params || {};

  // Estados para gerenciar as vacinas vindas do Firebase
  const [vacinas, setVacinas] = useState([]);
  const [loadingVacinas, setLoadingVacinas] = useState(true);
  
  // Estados para o componente de Select customizado
  const [modalVisivel, setModalVisivel] = useState(false);
  const [vacinaSelecionada, setVacinaSelecionada] = useState("");

  // ESTADOS PARA OS DADOS REAIS DO TUTOR (Buscados da pasta raiz 'usuarios')
  const [nomeTutor, setNomeTutor] = useState("Carregando...");
  const [telefoneTutor, setTelefoneTutor] = useState("Carregando...");

  // LISTAS DE VACINAS PADRONIZADAS POR ESPÉCIE
  const listaVacinasCaes = [
    "Vacina Antirrábica",
    "Vacina Polivalente (V10 / V8)",
    "Vacina de Giárdia",
    "Vacina de Tosse dos Canis",
    "Exame Geral / Check-up",
    "Vermifugação Atualizada"
  ];

  const listaVacinasGatos = [
    "Vacina Antirrábica",
    "Vacina Quádrupla (V4)",
    "Vacina Quíntupla (V5)",
    "Exame Geral / Check-up",
    "Vermifugação Atualizada"
  ];

  // Define qual lista usar baseando-se na espécie capturada
  const ehGato = petSelecionado?.especie?.toLowerCase() === 'gato' || petSelecionado?.especie?.toLowerCase() === 'felina';
  const opcoesVacinas = ehGato ? listaVacinasGatos : listaVacinasCaes;

  // BUSCAR DADOS DO TUTOR E AS VACINAS DO PET NO FIREBASE
  useEffect(() => {
    const buscarDadosDoBanco = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        // 1. BUSCA OS DADOS DO TUTOR NA PASTA PAI 'usuarios'
        const tutorRef = doc(db, "usuarios", uid);
        const tutorSnap = await getDoc(tutorRef);

        if (tutorSnap.exists()) {
          const dadosTutor = tutorSnap.data();
          setNomeTutor(dadosTutor.nome || "Não informado");
          setTelefoneTutor(dadosTutor.telefone || "Não informado");
        } else {
          setNomeTutor("Não encontrado");
          setTelefoneTutor("Não encontrado");
        }

        // 2. BUSCA AS VACINAS DO PET DENTRO DA SUBCOLEÇÃO
        if (petSelecionado?.id) {
          const vacinasRef = collection(db, "usuarios", uid, "pets", petSelecionado.id, "vacinas");
          const querySnapshot = await getDocs(vacinasRef);
          
          const listaVacinas = [];
          querySnapshot.forEach((doc) => {
            listaVacinas.push({ id: doc.id, ...doc.data() });
          });

          setVacinas(listaVacinas);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Firebase: ", error);
      } finally {
        setLoadingVacinas(false);
      }
    };

    buscarDadosDoBanco();
  }, [petSelecionado]);

  // ADICIONAR VACINA DIRETO NO FIREBASE
  const salvarVacinaNoFirebase = async () => {
    if (!vacinaSelecionada) {
      Alert.alert("Atenção", "Por favor, selecione uma vacina primeiro.");
      return;
    }

    try {
      const uid = auth.currentUser.uid;
      const vacinasRef = collection(db, "usuarios", uid, "pets", petSelecionado.id, "vacinas");

      const docRef = await addDoc(vacinasRef, {
        nomeVacina: vacinaSelecionada,
        criadoEm: serverTimestamp()
      });

      setVacinas([...vacinas, { id: docRef.id, nomeVacina: vacinaSelecionada }]);
      setVacinaSelecionada(""); 
      Alert.alert("Sucesso", "Vacina registrada com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a vacina: " + error.message);
    }
  };

  if (!petSelecionado) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Nenhum pet foi selecionado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* HEADER DA TELA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#083068" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carteirinha Digital</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* CARD PRINCIPAL DA CARTEIRINHA */}
        <View style={styles.idCard}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="id-card" size={24} color="#4A90E2" />
            <Text style={styles.cardHeaderTitle}>PET ID</Text>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: petSelecionado.foto || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300&auto=format&fit=crop' }} 
                style={styles.petAvatar} 
              />
              <View style={styles.badgeEspecie}>
                <MaterialCommunityIcons 
                  name={ehGato ? 'cat' : 'dog'} 
                  size={14} 
                  color="#FFF" 
                />
              </View>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.petName}>{petSelecionado.nome}</Text>
              
              <Text style={styles.label}>RG (ID do Pet)</Text>
              <Text style={styles.value}>
                {petSelecionado.id ? petSelecionado.id.substring(0, 8).toUpperCase() : "Sem registro"}
              </Text>
              
              <Text style={styles.label}>Espécie</Text>
              <Text style={styles.value}>{petSelecionado.especie}</Text>

              <Text style={styles.label}>Raça</Text>
              <Text style={styles.value}>{petSelecionado.raca || "Não informada"}</Text>

              <Text style={styles.label}>Sexo / Castrado</Text>
              <Text style={styles.value}>
                {petSelecionado.sexo === 'macho' ? 'Macho' : 'Fêmea'} • {petSelecionado.castrado === 'sim' ? 'Castrado' : 'Não'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* INFORMAÇÕES REAIS DO TUTOR DO BANCO DE DADOS */}
          <View style={styles.tutorSection}>
            <View style={styles.tutorInfoItem}>
              <Text style={styles.label}>Tutor</Text>
              <Text style={styles.tutorValue}>{nomeTutor}</Text>
            </View>
            <View style={styles.tutorInfoItem}>
              <Text style={styles.label}>Contato</Text>
              <Text style={styles.tutorValue}>{telefoneTutor}</Text>
            </View>
          </View>
        </View>

        {/* SEÇÃO DE VACINAS */}
        <View style={styles.sectionVacinas}>
          <View style={styles.vacinasHeader}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#083068" />
            <Text style={styles.sectionTitle}>Histórico de Vacinas</Text>
          </View>

          {/* Campo de Seleção Customizado */}
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.selectButton} 
              onPress={() => setModalVisivel(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.selectButtonText, !vacinaSelecionada && { color: '#A0AEC0' }]}>
                {vacinaSelecionada || "Selecione a vacina aplicada..."}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={22} color="#083068" style={{ marginRight: 10 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.addButton} onPress={salvarVacinaNoFirebase} activeOpacity={0.7}>
              <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Lista de Vacinas Dinâmica */}
          {loadingVacinas ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : vacinas.length === 0 ? (
            <Text style={{ color: '#A0AEC0', textAlign: 'center', fontStyle: 'italic', marginVertical: 10 }}>
              Nenhuma vacina registrada para o {petSelecionado.nome}.
            </Text>
          ) : (
            vacinas.map((vacina) => (
              <View key={vacina.id} style={styles.vacinaItem}>
                <View style={styles.vacinaIconContainer}>
                  <FontAwesome5 name="syringe" size={14} color="#4A90E2" />
                </View>
                <Text style={styles.vacinaText}>{vacina.nomeVacina}</Text>
                <MaterialCommunityIcons name="check-circle" size={20} color="#48BB78" />
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* MODAL DE OPÇÕES DO SELECT */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Vacina</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#A0AEC0" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={opcoesVacinas}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.optionItem,
                    vacinaSelecionada === item && styles.optionItemSelecionada
                  ]}
                  onPress={() => {
                    setVacinaSelecionada(item);
                    setModalVisivel(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    vacinaSelecionada === item && styles.optionTextSelecionada
                  ]}>
                    {item}
                  </Text>
                  {vacinaSelecionada === item && (
                    <MaterialCommunityIcons name="check" size={20} color="#083068" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="paw" size={28} color="#4A90E2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => navigation.navigate('MapScreen')}>
          <FontAwesome5 name="map-marked-alt" size={26} color="#A0AEC0" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0', paddingTop: Platform.OS === 'android' ? 35 : 10 },
  backButton: { padding: 8, borderRadius: 8, backgroundColor: '#EDF2F7' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#083068' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  idCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 }, android: { elevation: 4 } }), marginBottom: 25 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  cardHeaderTitle: { fontSize: 12, fontWeight: '800', color: '#A0AEC0', letterSpacing: 1.5 },
  cardBody: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  avatarContainer: { position: 'relative' },
  petAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#E2E8F0' },
  badgeEspecie: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4A90E2', padding: 6, borderRadius: 12, borderWidth: 2, borderColor: '#FFF' },
  infoBlock: { flex: 1 },
  petName: { fontSize: 24, fontWeight: '900', color: '#083068', marginBottom: 10 },
  label: { fontSize: 10, fontWeight: '700', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6 },
  value: { fontSize: 14, fontWeight: '600', color: '#2D3748' },
  divider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 16 },
  tutorSection: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  tutorInfoItem: { minWidth: '45%' },
  tutorValue: { fontSize: 13, fontWeight: '600', color: '#4A5568', marginTop: 2 },
  sectionVacinas: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 }, android: { elevation: 4 } }) },
  vacinasHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#083068' },
  inputContainer: { flexDirection: 'row', backgroundColor: '#F7FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', marginBottom: 16 },
  selectButton: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 14 },
  selectButtonText: { fontSize: 14, color: '#2D3748', fontWeight: '600' },
  addButton: { backgroundColor: '#083068', height: 48, width: 48, borderTopRightRadius: 13, borderBottomRightRadius: 13, justifyContent: 'center', alignItems: 'center' },
  vacinaItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 14, padding: 14, marginBottom: 10 },
  vacinaIconContainer: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#EBF8FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  vacinaText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#2D3748' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingVertical: 24, maxHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#083068' },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F7FAFC', paddingHorizontal: 8 },
  optionItemSelecionada: { backgroundColor: '#F0F4F8', borderRadius: 10 },
  optionText: { fontSize: 15, color: '#4A5568', fontWeight: '500' },
  optionTextSelecionada: { color: '#083068', fontWeight: '700' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 75, backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingBottom: Platform.OS === 'ios' ? 15 : 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 10 },
  navItem: { padding: 12, alignItems: 'center', justifyContent: 'center' }
});