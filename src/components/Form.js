import React from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Form({logo, h1, h2, h3, children, btnPlaceholder, screen1, screen1Text, screen2, screen2Text, onPress, validarForm }) {
  const navigation = useNavigation();
  
  return (
    <View style={styles.formContainer}>
      
      {logo ? (
        <Image
          source={logo}
          style={{
            width: 180,
            height: 180,
            resizeMode: "contain",
            alignSelf: "center",
          }}
        />
      ) : (
        <>
        <Text style={styles.h1}>{h1}</Text> 
        <Text style={styles.h2}>{h2}</Text>
        </>
      )}
       
      <Text style={styles.h3}>{h3}</Text>


      <View style={styles.widthWrapper}>
        {children}
      

        <TouchableOpacity 
          style={[styles.mainButton, !validarForm && styles.buttonDisabled]} 
          onPress={onPress}
          activeOpacity={0.8}
          disabled={!validarForm}
        >
          <Text style={styles.mainButtonText}>{btnPlaceholder}</Text>
        </TouchableOpacity>
        

        <View style={styles.linksContainer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate(screen1)}
            style={styles.linkTouchTarget}
          >
            <Text style={styles.linkText}>{screen1Text}</Text>
          </TouchableOpacity>

          {screen2 && (
            <TouchableOpacity 
              onPress={() => navigation.navigate(screen2)}
              style={styles.linkTouchTarget}
            >
              <Text style={styles.linkText}>{screen2Text}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  widthWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  h1: {
    fontSize: 40,
    fontWeight: '900', 
    marginBottom: 4,
    color: "#083068",
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    color: "#1A202C",
  },
  h3: {
    fontSize: 15,
    color: "#718096", 
    marginBottom: 20,
    textAlign: 'center',
  },
  mainButton: {
    backgroundColor: '#4A90E2', 
    width: 320, 
    height: 52, 
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  linksContainer: {
    marginTop: 16,
    gap: 12,
    alignItems: "center",
  },
  linkTouchTarget: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  linkText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    
    backgroundColor: '#cccccc', 
    width: 320,
    height: 52, 
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,

    shadowColor: '#959595',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 6,
    elevation: 0,    
    },
});