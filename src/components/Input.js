import React, { useState } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

export default function Input({ placeholder, ...props }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput  
        style={[
          styles.inputBox, 
          isFocused && styles.inputFocused
        ]} 
        placeholder={placeholder} 
        placeholderTextColor="#A0AEC0" 
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
        
          if (props.onBlur) props.onBlur(e);
        }}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14, 
    width: '100%',
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderColor: "#E2E8F0", 
    borderWidth: 1.5,
    paddingVertical: 12,    
    paddingHorizontal: 16,  
    borderRadius: 12,       
    width: '100%',          
    color: '#2D3748',     
    fontSize: 16,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    
    elevation: 1,
  },
  inputFocused: {
    borderColor: '#4A90E2', 
    backgroundColor: '#F8FAFC', 
  }
});