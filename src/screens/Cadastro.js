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
  Modal, // Added for the custom select field modal view
  FlatList // Added to render breeds efficiently
} from 'react-native';
import Form from "../components/Form.js";
import Input from "../components/Input.js";
import { db } from "../firebase/config";
import { TextInputMask } from 'react-native-masked-text';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, setDoc, collection, addDoc } from "firebase/firestore"; 
import { serverTimestamp } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';

// Predefined breed matrices linked directly to selected species
const LISTA_RACAS = {
  cachorro: ["Vira-lata (SRD)", "Labrador", "Golden Retriever", "German Shepherd", "Poodle", "Bulldog", "Pinscher", "Chihuahua", "Pug", "Outra Raça"],
  gato: ["Vira-lata (SRD)", "Persa", "Siamês", "Maine Coon", "Angorá", "Sphynx", "Ragdoll", "Outra Raça"]
};

export default function Cadastro({ navigation }) {
  const [value, setValue] = React.useState('macho');
  const [especie, setEspecie] = React.useState('cachorro');
  const [nome, setNome] = React.useState("");
  const [telefone, setTelefone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [confirmarSenha, setConfirmarSenha] = React.useState("");
  const [nomePet, setNomePet] = React.useState("");
  const [raca, setRaca] = React.useState("");
  const [castrado, setCastrado] = React.useState('nao');
  const [touched, setTouched] = React.useState(false);  

  const [errors, setErrors] = React.useState({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmationPassword, setShowConfirmationPassword] = React.useState(false);
  const [fotoPet, setFotoPet] = React.useState(null);

  // Modal Visibility State
  const [modalVisible, setModalVisible] = React.useState(false);

  // Automatically clears out-of-bounds breed choices when toggling species tabs
  const handleEspecieChange = (novaEspecie) => {
    setEspecie(novaEspecie);
    setRaca(""); // Clear the field to force a correct select choice
  };

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

  const emailRegex = /\S+@\S+\.\S+/;
  const validarForm = nome.length > 1 && senha.length >= 6 && confirmarSenha.length >= 6 && telefone.length === 15 && emailRegex.test(email) && raca.trim().length > 1 && nomePet.trim().length > 1;

  const validarCampo = (campo, valor) => {
    let mensagem = "";

    switch(campo) {
      case "nome":
        if (!valor.trim()) mensagem = "Nome é obrigatório";
        break;
      case "telefone":
        if (!telefone || telefone.length < 14) mensagem = "Telefone inválido";
        break;
      case "email":
        if (!emailRegex.test(valor)) mensagem = "Email inválido";
        break;
      case "senha":
        if (valor.length < 6) mensagem = "A senha deve ter pelo menos 6 caracteres";
        break;
      case "nomePet":
        if (!valor.trim()) mensagem = "Nome do pet é obrigatório";
        break;
      case "raca":
        if (!valor.trim()) mensagem = "A raça do pet é obrigatória";
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [campo]: mensagem
    }));
  };

  const validar = () => {
    let valido = true;
    const newErrors = { nome: "", telefone: "", email: "", senha: "", confirmarSenha: "", nomePet: "", raca: "" };

    if (!nome.trim()) { newErrors.nome = "Nome é obrigatório"; valido = false; }
    if (!telefone || telefone.length < 14) { newErrors.telefone = "Telefone inválido"; valido = false; }
    if (!emailRegex.test(email)) { newErrors.email = "Email inválido"; valido = false; }
    if (senha.length < 6) { newErrors.senha = "A senha deve ter pelo menos 6 caracteres"; valido = false; }
    if (senha !== confirmarSenha) { newErrors.confirmarSenha = "As senhas não coincidem"; valido = false; }
    if (!nomePet.trim()) { newErrors.nomePet = "Nome do pet é obrigatório"; valido = false; }
    if (!raca.trim()) { newErrors.raca = "A raça do pet é obrigatória"; valido = false; }

    setErrors(newErrors);
    return valido;
  };

  const cadastrar = async () => {
    if(validar()) {
      const emailNormalizado = email.toLowerCase().trim();
      const nomeNormalizado = nome.trim();
      const nomePetNormalizado = nomePet.trim();
      const racaNormalizada = raca.trim();

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailNormalizado, senha);
        const uid = userCredential.user.uid;
        
        try {
          await setDoc(doc(db, "usuarios", uid), {
            uid: uid,
            nome: nomeNormalizado,
            telefone,
            email: emailNormalizado,
            criadoEm: serverTimestamp()
          });

          await addDoc(collection(db, "usuarios", uid, "pets"), {
            nome: nomePetNormalizado,
            especie,
            raca: racaNormalizada,
            sexo: value,
            castrado: castrado,
            foto: fotoPet, 
            criadoEm: serverTimestamp()
          });

        } catch(firestoreError) {
          await userCredential.user.delete();
          throw firestoreError;
        }

        setValue("macho");
        setEspecie("cachorro");
        setNome("");
        setTelefone("");
        setEmail("");
        setSenha("");
        setConfirmarSenha("");
        setNomePet("");
        setRaca("");
        setCastrado("nao");
        setFotoPet(null); 
        
        Alert.alert('Status do Cadastro:', 'Cadastro realizado com sucesso! 🐾', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          Alert.alert("Erro", "Este email já está em uso.");
          return;
        }
        Alert.alert("Erro", error.message);
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
            h2="Cadastro"
            h3="Crie sua conta no PetSuam"
            btnPlaceholder="Enviar"
            screen1="Login"
            screen1Text="Já tem conta? Entrar"
            onPress={cadastrar}
            validarForm={validarForm}
          >
            {/* --- SEÇÃO: SEUS DADOS --- */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Seus Dados</Text>
              
              <Input 
                placeholder="Nome Completo" 
                maxLength={50} 
                autoCapitalize="words" 
                value={nome} 
                onChangeText={setNome} 
                onBlur={() => { setTouched(true); validarCampo("nome", nome); }}
              />
              {errors.nome ? <Text style={styles.errorStyle}>{errors.nome}</Text> : null}

              <TextInputMask
                placeholder='Telefone'
                type={'cel-phone'}
                options={{ maskType: 'BRL', withDDD: true, dddMask: '(99) ' }}
                value={telefone}
                onChangeText={setTelefone}
                style={styles.inputBox}
                placeholderTextColor="#a1a1a1"
                onBlur={() => { setTouched(true); validarCampo("telefone", telefone); }}
              />
              {errors.telefone ? <Text style={styles.errorStyle}>{errors.telefone}</Text> : null}

              <Input 
                placeholder="Email" 
                keyboardType="email-address" 
                autoCapitalize="none" 
                value={email} 
                onChangeText={setEmail} 
                onBlur={() => { setTouched(true); validarCampo("email", email); }}
              />
              {errors.email ? <Text style={styles.errorStyle}>{errors.email}</Text> : null}

              <View style={styles.passwordContainer}>
                <Input 
                  placeholder="Senha" 
                  maxLength={10} 
                  secureTextEntry={!showPassword} 
                  value={senha} 
                  onChangeText={setSenha} 
                  onBlur={() => { setTouched(true); validarCampo("senha", senha); }}
                /> 
                <TouchableOpacity style={styles.seePassword} onPress={() => setShowPassword(!showPassword)}>
                  <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={22} color="#4A5568" />
                </TouchableOpacity>
              </View>
              {errors.senha ? <Text style={styles.errorStyle}>{errors.senha}</Text> : null}

              <View style={styles.passwordContainer}>
                <Input 
                  placeholder="Confirmar Senha" 
                  maxLength={10} 
                  secureTextEntry={!showConfirmationPassword} 
                  value={confirmarSenha} 
                  onChangeText={setConfirmarSenha} 
                />   
                <TouchableOpacity style={styles.seePassword} onPress={() => setShowConfirmationPassword(!showConfirmationPassword)}>
                  <FontAwesome name={showConfirmationPassword ? "eye-slash" : "eye"} size={22} color="#4A5568" />
                </TouchableOpacity>            
              </View>
              {errors.confirmarSenha ? <Text style={styles.errorStyle}>{errors.confirmarSenha}</Text> : null}
            </View>

            {/* --- SEÇÃO: DADOS DO PET --- */}
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
                onBlur={() => { setTouched(true); validarCampo("nomePet", nomePet); }}
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

              {/* MODIFIED: Custom Select Field UI Wrapper for Breed */}
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
                  <MaterialCommunityIcons name="check-bold" size={18} color={castrado === 'sim' ? '#FFF' : '#4A5568'} />
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

      {/* NEW ELEMENT: Overlay Option Picker Modal */}
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
  toggleButton: { flex: 1, flexDirection: 'row', height: 44, backgroundColor: '#EDF2F7', borderRadius: 10, justifyContent: 'center',  alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#CBD5E0' },
  toggleButtonActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginLeft: 6 },
  toggleTextActive: { color: '#FFFFFF' },
  inputBox: { backgroundColor: '#FFF', borderColor: "#CBD5E0", borderWidth: 1, padding: 12, borderRadius: 10, width: '100%', color: 'black', marginTop: 12, fontSize: 16 },
  passwordContainer: { position: 'relative', width: '100%' },
  seePassword: { position: "absolute", right: 12, height: '100%', justifyContent: 'center', paddingTop: 10 },
  errorStyle: { color: "#E53E3E", fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '500' },
  
  // NEW STYLING DICTIONARIES FOR THE CUSTOM BREED SELECTOR
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