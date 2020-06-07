import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native'
import { Feather as Icon } from '@expo/vector-icons'
import  Constants  from 'expo-constants'
import { useNavigation } from '@react-navigation/native'
import MapView, {Marker} from 'react-native-maps'
import { SvgUri } from 'react-native-svg'
import api from '../../services/api'
import  * as Location from 'expo-location'

interface Item {
  id: number,
  title: string,
  image_url: string
}

interface Point {
  id: number,
  name: string,
  image: string,
  latitude: number,
  longitude: number,
}

const Points = () => {

    const navigation = useNavigation()
    const [items, setItems] = useState<Item[]>([])
    const [points, setPoints] = useState<Point[]>([])
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])

    useEffect(() => {
      api.get('items').then(response => {
        setItems(response.data)
      })
    }, [])

    useEffect(() => {
      api.get('points', {
        params: {
          city: 'São José do Rio Preto',
          uf: 'SP',
          items: [1]
        }
      }).then(response => {        
        setPoints(response.data)        
      })
    }, [])

    useEffect(() => {

      async function LoadPosition(){
        const { status } = await Location.requestPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('ops!', 'Precisamos de sua permissão para usar a localização atual')
          return  
        }
        const location = await Location.getCurrentPositionAsync()
        const { latitude, longitude } = location.coords
        setInitialPosition([
          latitude,
          longitude
        ])
      }
      LoadPosition()
    }, [])

    function handleNavigationGoBack() {
      navigation.goBack()
    }
    function handleNavigationTo(Dest: string, id: number) {
      navigation.navigate(Dest, {point_id: id})
    }
    function handleSelectItem(id: number){
      const alreadySelected = selectedItems.findIndex(item => item === id)
      if (alreadySelected >= 0) {
          const filteredItems = selectedItems.filter(item => item !== id)
          setSelectedItems(filteredItems)
      }
      else {
          setSelectedItems([...selectedItems, id])
      }  
    } 
    return (
        <>
            <View style={styles.container}> 
              <View style={styles.containerContent}>
                <TouchableOpacity onPress={() => {
                      handleNavigationGoBack()
                  }}>  
                      <Icon name='arrow-left' size={20} color='#34cb79'>
                      </Icon>
                  </TouchableOpacity>
                  <Text style={styles.title}>
                      Bem vindo.
                  </Text>
                  <Text style={styles.description}>
                      Encontre no mapa um ponto de coleta.
                  </Text>
                  <View style={styles.mapContainer}>
                      {
                        initialPosition[0] !== 0 && (
                          <MapView 
                            style={styles.map}
                            loadingEnabled={initialPosition[0] === 0}
                            initialRegion={{                         
                              latitude: initialPosition[0],
                              longitude:initialPosition[1],
                              latitudeDelta: 0.014,
                              longitudeDelta: 0.014
                            }}>

                              { points.map(point => (
                                  <Marker 
                                    key={String(point.id)}                           
                                    style={styles.mapMarker}
                                    onPress={() => { handleNavigationTo('Detail', point.id)}}
                                  coordinate={{
                                    latitude: point.latitude,
                                    longitude: point.longitude,
                                  }} >
                                    <View style={styles.mapMarkerContainer}>
                                      <Image style={styles.mapMarkerImage} source={{ uri: point.image}} ></Image>  
                                      <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                    </View>                                
                                  </Marker>

                                ))
                              }
                              
                          </MapView>
                        )
                      }
                 </View>
              </View>             
              
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                  >
                    
                  <View style={styles.itemsContainer}>
                  {items.map(item => (
                      <TouchableOpacity 
                      key={item.id}                        
                      style={[
                          styles.item,
                          selectedItems.includes(item.id) ? styles.selectedItem : {}
                        ]}
                      activeOpacity={0.7}
                      onPress={() => {handleSelectItem(item.id)}}>
                        <SvgUri width={42} height={42} uri={item.image_url} ></SvgUri>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                     </TouchableOpacity>
                      ))}                      
                     
                    </View>
                  </ScrollView> 
            </View>
        </>
    )
}

export default Points

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 0,
      paddingTop: 20 + Constants.statusBarHeight,
    },

    containerContent: {
      flex: 12,
      paddingHorizontal: 32,
      paddingTop: 20 + Constants.statusBarHeight,
     
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 13,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
      marginLeft: 0,
      paddingHorizontal: 0,

    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 13,
    },
  });