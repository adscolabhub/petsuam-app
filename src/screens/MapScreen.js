import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, ImageBackground, Platform, ActivityIndicator, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import { MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const GOOGLE_MAPS_APIKEY = 'AIzaSyACYI38ck5E_hWiZxpDsOG8eA01KnN5R20';

export default function MapScreen() {
    const mapRef = useRef(null);
    const [location, setLocation] = useState(null);
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);

    useEffect(() => {
        getUserLocation();
    }, []);

    async function getUserLocation() {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permisão Negada', 'A permissão de localização é necessária para usar este recurso.');
            return;
        }
        let currentLocation = await Location.getCurrentPositionAsync({});
        const coords = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
        };
        setLocation(coords);
    }
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
              navigation.replace('Login'); // Usa o replace para limpar o histórico de navegação
            } catch (error) {
              Alert.alert("Erro ao sair", "Não foi possível encerrar a sessão: " + error.message);
            }
          } 
        }
      ]
    );
  };
    async function searchPlaces(type) {
        if (!location) return;
        let keyword = 
            type === 'petshop' ? 'pet shop' : 'veterinary clinic';
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=5000&type=${type}&keyword=${keyword}&key=${GOOGLE_MAPS_APIKEY}`;
        try { 
            const response = await fetch(url);
            const data = await response.json();
            setPlaces(data.results);
        } catch (error) {
            return(<View style={styles.center}>
                <ActivityIndicator size="large" color="#083068" />
                <Text>API NÃO RESPONDENDO</Text>
            </View>
            );
            console.log(error);
        }
    }
    if (!location) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#083068" />
                <Text>Obtendo localização...</Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/background4.png')}
                resizeMode="cover"
                style={styles.image}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    >
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>Serviços Próximos</Text>
                        <TouchableOpacity 
                        style={styles.logoutButton} 
                        onPress={deslogarUsuario}
                        activeOpacity={0.6}
                        >
                        <MaterialCommunityIcons name="logout" size={26} color="#E53E3E" />
                        </TouchableOpacity>
                    </View>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        showsUserLocation
                        initialRegion={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                    >
                        {places.map((place, index) => (
                            <Marker
                                key={index}
                                coordinate={{
                                    latitude: place.geometry.location.lat,
                                    longitude: place.geometry.location.lng,
                                }}
                                title={place.name}
                                description={place.vicinity}
                                onPress={() => setSelectedPlace({
                                    latitude: place.geometry.location.lat,
                                    longitude: place.geometry.location.lng
                                })
                                }
                            />
                        ))}
                        {selectedPlace && (
                            <MapViewDirections
                                origin={location}
                                destination={selectedPlace}
                                apikey={GOOGLE_MAPS_APIKEY}
                                strokeWidth={4}
                                strokeColor="blue"
                            />
                        )}
                    </MapView>
                    <View style={styles.buttonsContainer}>
                        {/* PETSHOPS */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => searchPlaces('petshop')}
                            activeOpacity={0.88}
                        >
                            <View style={styles.buttonContent}>
                                <View style={styles.iconContainer}>
                                    <MaterialIcons
                                        name="pets"
                                        size={24}
                                        color="#FFFFFF"
                                    />
                                </View>
                                <View>
                                    <Text style={styles.buttonTitle}>
                                        Pet Shops
                                    </Text>
                                    <Text style={styles.buttonSubtitle}>
                                        Encontrar agora
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        {/* VETERINÁRIAS */}
                        <TouchableOpacity
                            style={[styles.button, styles.vetButton]}
                            onPress={() => searchPlaces('veterinary')}
                            activeOpacity={0.88}
                        >
                            <View style={styles.buttonContent}>
                                <View style={styles.iconContainer}>
                                    <MaterialCommunityIcons
                                        name="stethoscope"
                                        size={24}
                                        color="#FFFFFF"
                                    />
                                </View>
                                <View>
                                    <Text style={styles.buttonTitle}>
                                        Veterinárias
                                    </Text>
                                    <Text style={styles.buttonSubtitle}>
                                        Clínicas perto
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    { /*
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => searchPlaces('petshop')}>
                            <Text style={styles.buttonText}>Pet Shops</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => searchPlaces('veterinary')}>
                            <Text style={styles.buttonText}>Veterinárias</Text>
                        </TouchableOpacity>
                    </View>
                    */}
                </ScrollView>
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
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },

  buttonsContainer: {
    position: "absolute",

    bottom: 145,

    width: "100%",

    flexDirection: "row",

    justifyContent: "space-between",

    alignSelf: "center",

    padding: 10,

    borderRadiusTopLeft: 32,
    borderRadiusTopRight: 32,

    backgroundColor: "rgba(255,255,255,0.22)",

    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.35)",

    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 10,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,

    elevation: 12,
},
  button: {
    flex: 1,

    height: 82,

    marginHorizontal: 6,

    borderRadius: 24,

    justifyContent: "center",

    paddingHorizontal: 18,

    backgroundColor: "rgba(59,130,246,0.88)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",

    shadowColor: "#2563EB",
    shadowOffset: {
        width: 0,
        height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,

    elevation: 8,
},

vetButton: {
    backgroundColor: "rgba(139,92,246,0.88)",
},

buttonContent: {
    flexDirection: "row",
    alignItems: "center",
},

iconContainer: {
    width: 35,
    height: 35,

    borderRadius: 24,

    backgroundColor: "rgba(255,255,255,0.18)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
},

buttonTitle: {
    color: "#FFFFFF",

    fontSize: 18,

    fontWeight: "700",
},

buttonSubtitle: {
    color: "rgba(255,255,255,0.82)",

    fontSize: 13,

    marginTop: 2,
},

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    },
  image: {
    flex: 1,
    width: '100%',
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
});