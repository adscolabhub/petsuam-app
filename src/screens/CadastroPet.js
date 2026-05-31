import { StatusBar } from 'expo-status-bar';
import React from "react";
import { 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet, 
  View, 
  ImageBackground, 
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Modal, // Added for the picker overlay
  FlatList // Added to handle rows fluidly
} from 'react-native';
import Form from "../components/Form.js";
import Input from "../components/Input.js";
import { db, auth } from "../firebase/config"; 
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';

// Predefined breed database lookup tables
const LISTA_RACAS = {
  cachorro: ["Vira-lata (SRD)", "Labrador", "Golden Retriever", "Pastor Alemão", "Poodle", "Bulldog", "Pinscher", "Chihuahua", "Pug", "Outra Raça"],
  gato: ["Vira-lata (SRD)", "Persa", "Siamês", "Maine Coon", "Angorá", "Sphynx", "Ragdoll", "Outra Raça"]
};

export default function CadastroPet({ navigation }) {
  const [value, setValue] = React.useState('macho');
  const [especie, setEspecie] = React.useState('cachorro');
  const [nomePet, setNomePet] = React.useState("");
  const [raca, setRaca] = React.useState("");
  const [castrado, setCastrado] = React.useState('nao');
  const [errors, setErrors] = React.useState({});
  const [fotoPet, setFotoPet] = React.useState(null);

  // NEW STATE: Visibility toggle for selection modal window
  const [modalVisible, setModalVisible] = React.useState(false);

  // Safely wipes breed state when species changes to avoid misaligned data
  const handleEspecieChange = (novaEspecie) => {
    setEspecie(novaEspecie);
    setRaca(""); // Clear select string
  };

  const validarForm = nomePet.trim().length > 1 && raca.trim().length > 1;

  const selecionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permissão necessária", "Precisamos de permissão para acessar suas fotos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, 
      aspect: [1, 1],      
      quality: 0.4,        
      base64: true,        
    });

    if (!result.canceled) {
      setFotoPet(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const validarCampo = (campo, valor) => {
    let mensagem = "";
    switch(campo) {
      case "nomePet":
        if (!valor.trim()) mensagem = "Nome do pet é obrigatório";
        break;
      case "raca":
        if (!valor.trim()) mensagem = "A raça do pet é obrigatória";
        break;
    }
    setErrors((prev) => ({ ...prev, [campo]: mensagem }));
  };

  const validar = () => {
    let valido = true;
    const newErrors = { nomePet: "", raca: "" };
    if (!nomePet.trim()) { newErrors.nomePet = "Nome do pet é obrigatório"; valido = false; }
    if (!raca.trim()) { newErrors.raca = "A raça do pet é obrigatória"; valido = false; }
    setErrors(newErrors);
    return valido;
  };

  const salvarPet = async () => {
    if (validar()) {
      const nomePetNormalizado = nomePet.trim();
      const racaNormalizada = raca.trim();

      try {
        const usuarioAtual = auth.currentUser;
        
        if (!usuarioAtual) {
          Alert.alert("Erro", "Sessão expirada. Por favor, faça login novamente.");
          navigation.navigate('Login');
          return;
        }

        const uid = usuarioAtual.uid;

        await addDoc(collection(db, "usuarios", uid, "pets"), {
          nome: nomePetNormalizado,
          especie: especie,
          raca: racaNormalizada,
          sexo: value,
          castrado: castrado,
          foto: fotoPet, 
          criadoEm: serverTimestamp()
        });

        setValue("macho");
        setEspecie("cachorro");
        setNomePet("");
        setRaca("");
        setCastrado("nao");
        setFotoPet(null); 
        
        Alert.alert('Sucesso!', '🐾 Novo pet cadastrado com sucesso!', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } catch (error) {
        Alert.alert("Erro ao salvar", "Não foi possível cadastrar o pet: " + error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ImageBackground
        source={require('../assets/background4.png')}
        resizeMode="cover"
        style={styles.image}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Form
            h1="PetSuam"
            h2="Cadastro do Pet"
            h3="Adicione um pet ao PetSuam"
            btnPlaceholder="Salvar Pet"
            screen1="Home"
            screen1Text="Voltar"
            onPress={salvarPet}
            validarForm={validarForm}
          >
            
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Dados do Pet</Text>

              <TouchableOpacity style={styles.avatarContainer} onPress={selecionarFoto}>
                {fotoPet ? (
                  <Image source={{ uri: fotoPet }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialCommunityIcons name="camera-plus" size={28} color="#4A5568" />
                    <Text style={styles.avatarText}>Add Foto</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Input 
                placeholder="Nome do Pet" 
                maxLength={30} 
                autoCapitalize="words" 
                value={nomePet} 
                onChangeText={setNomePet}
                onBlur={() => validarCampo("nomePet", nomePet)}
              />
              {errors.nomePet ? <Text style={styles.errorStyle}>{errors.nomePet}</Text> : null}

              {/* Selector de Espécie */}
              <Text style={styles.labelSelect}>Espécie</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity 
                  style={[styles.toggleButton, especie === 'cachorro' && styles.toggleButtonActive]}
                  onPress={() => handleEspecieChange('cachorro')}
                >
                  <MaterialCommunityIcons name="dog" size={20} color={especie === 'cachorro' ? '#FFF' : '#4A5568'} />
                  <Text style={[styles.toggleText, especie === 'cachorro' && styles.toggleTextActive]}>Cachorro</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleButton, especie === 'gato' && styles.toggleButtonActive]}
                  onPress={() => handleEspecieChange('gato')}
                >
                  <MaterialCommunityIcons name="cat" size={20} color={especie === 'gato' ? '#FFF' : '#4A5568'} />
                  <Text style={[styles.toggleText, especie === 'gato' && styles.toggleTextActive]}>Gato</Text>
                </TouchableOpacity>
              </View>

              {/* MODIFIED: Custom Choice Trigger for Picker Overlay Container */}
              <Text style={styles.labelSelect}>Raça</Text>
              <TouchableOpacity 
                style={styles.selectTrigger} 
                onPress={() => setModalVisible(true)}
              >
                <Text style={[styles.selectTriggerText, !raca && { color: "#a1a1a1" }]}>
                  {raca ? raca : "Selecione a Raça"}
                </Text>
                <FontAwesome name="chevron-down" size={14} color="#4A5568" />
              </TouchableOpacity>
              {errors.raca ? <Text style={styles.errorStyle}>{errors.raca}</Text> : null}

              {/* Selector de Sexo */}
              <Text style={styles.labelSelect}>Sexo</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity 
                  style={[styles.toggleButton, value === 'macho' && styles.toggleButtonActive]}
                  onPress={() => setValue('macho')}
                >
                  <MaterialCommunityIcons name="gender-male" size={20} color={value === 'macho' ? '#FFF' : '#4A5568'} />
                  <Text style={[styles.toggleText, value === 'macho' && styles.toggleTextActive]}>Macho</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleButton, value === 'femea' && styles.toggleButtonActive]}
                  onPress={() => setValue('femea')}
                >
                  <MaterialCommunityIcons name="gender-female" size={20} color={value === 'femea' ? '#FFF' : '#4A5568'} />
                  <Text style={[styles.toggleText, value === 'femea' && styles.toggleTextActive]}>Fêmea</Text>
                </TouchableOpacity>
              </View>

              {/* Selector de Castrado */}
              <Text style={styles.labelSelect}>O Pet é Castrado?</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity 
                  style={[styles.toggleButton, castrado === 'sim' && styles.toggleButtonActive]}
                  onPress={() => setCastrado('sim')}
                >
                  <MaterialCommunityIcons name="check" size={18} color={castrado === 'sim' ? '#FFF' : '#4A5568'} />
                  <Text style={[styles.toggleText, castrado === 'sim' && styles.toggleTextActive]}>Sim</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleButton, castrado === 'nao' && styles.toggleButtonActive]}
                  onPress={() => setCastrado('nao')}
                >
                  <MaterialCommunityIcons name="close" size={18} color={castrado === 'nao' ? '#FFF' : '#4A5568'} />
                  <Text style={[styles.toggleText, castrado === 'nao' && styles.toggleTextActive]}>Não</Text>
                </TouchableOpacity>
              </View>
            </View>
            
          </Form>
        </ScrollView>
      </ImageBackground>

      {/* NEW VIEWPORT LAYOUT: Slidable Bottom Selection Overlay */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Raça</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="times-circle" size={24} color="#E53E3E" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={LISTA_RACAS[especie]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.optionItem, raca === item && styles.optionItemActive]} 
                  onPress={() => {
                    setRaca(item);
                    setModalVisible(false);
                    validarCampo("raca", item);
                  }}
                >
                  <Text style={[styles.optionText, raca === item && styles.optionTextActive]}>{item}</Text>
                  {raca === item && <FontAwesome name="check" size={16} color="#FFF" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { flex: 1, width: '100%' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: 40, paddingTop: 40 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 20,
    width: 320,
    alignSelf: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
  },
  avatarText: {
    fontSize: 10,
    color: '#4A5568',
    fontWeight: 'bold',
    marginTop: 2,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 5 },
  labelSelect: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginTop: 15, marginBottom: 8 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  toggleButton: { flex: 1, flexDirection: 'row', height: 44, backgroundColor: '#EDF2F7', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#CBD5E0' },
  toggleButtonActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginLeft: 6 },
  toggleTextActive: { color: '#FFFFFF' },
  errorStyle: { color: "#E53E3E", fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '500' },

  // NEW STYLES: Custom Dropdown Menu triggers and slidable panel overrides
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderColor: "#CBD5E0",
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    width: '100%',
    height: 48,
    marginTop: 4
  },
  selectTriggerText: { fontSize: 16, color: '#000' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F7FAFC'
  },
  optionItemActive: { backgroundColor: '#4A90E2' },
  optionText: { fontSize: 16, color: '#4A5568', fontWeight: '500' },
  optionTextActive: { color: '#FFF', fontWeight: '700' }
});