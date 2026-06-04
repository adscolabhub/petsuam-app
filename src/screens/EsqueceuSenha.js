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
  Alert
} from 'react-native';
import Form from "../components/Form.js";
import Input from "../components/Input.js";
import { auth } from "../firebase/config"; 
import { sendPasswordResetEmail } from "firebase/auth";

export default function EsqueceuSenha({ navigation }) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");

  // Enables the submit button only if the email field has content
  const validarForm = email.trim().length > 4;

  const validarCampo = (valor) => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(valor)) {
      setError("Por favor, insira um e-mail válido.");
    } else {
      setError("");
    }
  };

  const enviarEmailRecuperacao = async () => {
    if (!email.trim()) {
      setError("O campo de e-mail é obrigatório.");
      return;
    }

    const emailNormalizado = email.toLowerCase().trim();

    try {
      // Triggers Firebase to send the password reset link
      await sendPasswordResetEmail(auth, emailNormalizado);
      
      Alert.alert(
        'Sucesso! 🐾', 
        'Um link de redefinição de senha foi enviado para o seu e-mail. Não se esqueça de verificar a caixa de spam!', 
        [
          { text: 'Ir para o Login', onPress: () => navigation.navigate('Login') }
        ]
      );
    } catch (err) {
      // Handles classic Firebase account validation edge cases
      switch (err.code) {
        case "auth/invalid-email":
          setError("O formato do e-mail digitado é inválido.");
          break;
        case "auth/user-not-found":
          setError("Não existe nenhum usuário cadastrado com este e-mail.");
          break;
        default:
          Alert.alert("Erro", "Não foi possível enviar o e-mail: " + err.message);
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
            h2="Recuperar Senha"
            h3="Insira seu e-mail abaixo para receber o link de redefinição."
            btnPlaceholder="Enviar Link"
            screen1="Login"
            screen1Text="Voltar para o Login"
            onPress={enviarEmailRecuperacao}
            validarForm={validarForm}
          >
            
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Sua Conta</Text>

              <Input 
                placeholder="E-mail Cadastrado" 
                keyboardType="email-address" 
                autoCapitalize="none" 
                value={email} 
                onChangeText={setEmail} 
                onBlur={() => validarCampo(email)}
              />
              {error ? <Text style={styles.errorStyle}>{error}</Text> : null}
            </View>
            
          </Form>
        </ScrollView>
      </ImageBackground>
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
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 5 },
  errorStyle: { color: "#E53E3E", fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '500' }
});