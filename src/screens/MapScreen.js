import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, ImageBackground, Platform, ActivityIndicator, ScrollView, Modal } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import { MaterialCommunityIcons, FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';

const GOOGLE_MAPS_APIKEY = '';

export default function MapScreen({ navigation }) {
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

    async function searchPlaces(type) {
        if (!location) return;
        try { 
            let googleType = "";
            if (type === 'petshop') {
                googleType = 'pet_store';
            } else if (type === 'veterinary') {
                googleType = 'veterinary_care';
            }
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
                `?location=${location.latitude},${location.longitude}` +
                `&radius=5000` +
                `&type=${googleType}` +
                `&key=${GOOGLE_MAPS_APIKEY}`;
            console.log("URL:", url);
            const response = await fetch(url);
            const data = await response.json();
            console.log("DATA:", data);
            if (data.status !== 'OK') {
                Alert.alert('Erro', 'Não foi possível obter os locais: ' + data.status);
                return;
            } else {
                setPlaces(data.results);   
            }
        } catch (error) {
            console.log("ERRO FETCH:");
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
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#083068" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Serviços Próximos</Text>
                <View style={{ width: 40 }} />
             
            </View>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE} 
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
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => navigation.navigate('Home')}>
                <MaterialCommunityIcons name="paw" size={28} color="#A0AEC0" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => navigation.navigate('MapScreen')}>
                <FontAwesome5 name="map-marked-alt" size={26} color="#4A90E2" />
                </TouchableOpacity>
            </View>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    map: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    },
    buttonsContainer: {
        position: "absolute",
        bottom: 75,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignSelf: "center",
        padding: 10,
        borderRadius: 32,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
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
        elevation: 0,
    },
    button: {
        flex: 1,
        height: 82,
        marginHorizontal: 6,
        borderRadius: 24,
        justifyContent: "center",
        paddingHorizontal: 18,
        backgroundColor: "#2563EB",
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
        backgroundColor: "#0EA5A4",
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
        padding: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FED7D7',
        marginLeft: -130,
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderColor: '#E2E8F0',
        paddingTop: Platform.OS === 'android' ? 18 : 10
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#083068'
    },
});