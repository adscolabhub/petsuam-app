import React, { useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  ImageBackground, 
  Alert, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import Form from "../components/Form.js";
import Input from "../components/Input.js";
import { FontAwesome } from '@expo/vector-icons';
import { auth } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login({navigation}) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const emailRegex = /\S+@\S+\.\S+/;
  const validarForm = senha.length >= 6  && emailRegex.test(email);


  const validar = () => {
    let valido = true;
    const newErrors = { email: "", senha: "" };

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Email inválido";
      valido = false;
    }

    if (senha.length < 6) {
      newErrors.senha = "A senha deve ter pelo menos 6 caracteres";
      valido = false;
    } 

    setError(newErrors);
    return valido;
  };

  const entrar = async () => {
    const emailNormalizado = email.toLowerCase().trim();
    if (validar()) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          emailNormalizado,
          senha
        );

        console.log("Usuário logado:", userCredential.user);
        Alert.alert('Status do Login:', 'Login realizado com sucesso! 🐾', [
          {
            text: 'OK',
            onPress: () => {
            navigation.navigate('Home'); 
            }
          }
        ]);
        
        // navigation.navigate("Home");
      } catch (error) {
        if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
          Alert.alert("Erro", "Email ou senha inválidos.");
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
        <Form
          h1="PetSuam"
          h2="Login"
          h3="Bem-vindo ao PetSuam"
          btnPlaceholder="Enviar"
          screen1="Cadastro"
          screen1Text="Criar conta"
          screen2="EsqueceuSenha" // You can change this to "ResetPassword" later if needed
          screen2Text="Esqueci minha senha"
          onPress={entrar}
          validarForm={validarForm}
        >
          {/* Visual card to organize elements nicely */}
          <View style={styles.card}>
            <Input
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            {error.email ? <Text style={styles.errorStyle}>{error.email}</Text> : null}

            <View style={styles.passwordContainer}>
              <Input
                placeholder="Senha"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={senha} 
                onChangeText={setSenha}
                maxLength={10}
              />
              <TouchableOpacity 
                style={styles.seePassword} 
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <FontAwesome 
                  name={showPassword ? "eye-slash" : "eye"} 
                  size={22} 
                  color="#4A5568" 
                />
              </TouchableOpacity>
            </View>
            {error.senha ? <Text style={styles.errorStyle}>{error.senha}</Text> : null}
          </View>
        </Form>
        
        <StatusBar style="auto" />
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 20,
    width: 320,
    alignSelf: 'center',
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  seePassword: {
    position: "absolute",
    right: 12,
    height: '100%',
    justifyContent: 'center',
    paddingTop: 14, // Aligns perfectly with the new spacing of your pretty Input
  },
  errorStyle: {
    color: "#E53E3E",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  }
});