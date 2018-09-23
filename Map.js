import React from 'react';
import MapView, { Marker, ProviderPropType } from 'react-native-maps';
import { AsyncStorage, StyleSheet, Text, View, Dimensions, Image } from 'react-native';
import { Container, Header, Content, Footer, FooterTab, Button, Icon, Card, CardItem } from 'native-base';
import {reduce} from './ reducers'
const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const Images = [
  { uri: "https://i.imgur.com/LntVN6B.jpg" },
  { uri: "https://i.imgur.com/N7rlQYt.jpg" },
  { uri: "https://i.imgur.com/UDrH0wm.jpg" },
  { uri: "https://i.imgur.com/Ka8kNST.jpg" }
]

export default class Map extends React.Component {
   
    constructor(props){
      super(props)
      this.state = {
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
          error:null,
          markers: [
            {
              coordinate:{
                latitude: 43.7860579,
                longitude: -79.349437,
              },
              title: "Great Bike Rack",
              description: "Slots Available: 3",
              free: 3,
              capacity: 6,
              image: Images[0],
              color: "#E7E7E7"
            },
          ],
          selected: {
            free: 0,
            title: null,
            image: null,
          },
          rack: "No rack selected",
          reserved: false,
      };
    }
    componentWillMount() {
      AsyncStorage.getItem('selected', (err, result) => {
        this.setState({
          selected: JSON.parse(result),
        });
      });
      AsyncStorage.getItem('reserved', (err, result) => {
        console.log(JSON.parse(result).status);
        this.setState({
          reserved: JSON.parse(result).status,
        });
      })
      navigator.geolocation.getCurrentPosition(
         (position) => {
           this.setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
           });
           this.forceUpdate()
         },
         (error) => this.setState({ error: error.message }),
       );
  
     }
    
     onMarkerPress(marker) {
       this.setState(
         {
          selected: marker,
        }
       )
     }
     submit() {
       if(this.state.selected.free > 0) {
         this.setState({reserved: true})
         console.log('you failure', this.state.reserved);
       } else {
         console.log("rejected!")
       }
     }
    render() {
  
      var markers = this.state.markers || [];
      var free = this.state.selected.free || "No location selected";
      var title = this.state.selected.title || "No location selected";
      var image = this.state.selected.image ||""
      var reserved = this.state.reserved;
      return (
        <View>
            <MapView
              ref={map => {this.map = map}}
              style={styles.map}
              pitchEnabled={false}
              rotateEnabled={false}
              initialRegion={{
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }}
              showsUserLocation = {true}
  
            >
                {markers.map((marker, index) => {
                return (
                    <MapView.Marker 
                      key={index} 
                      coordinate={marker.coordinate}
                      title={marker.title}
                      description={marker.description}
                      showCallout={true}
                      pinColor={'green'}
                      onPress={() => { this.onMarkerPress(marker) }}
                      >
                    </MapView.Marker>
                  );
              })}  
            </MapView>
            <Card style={styles.submit}>
              <Text>Spots Available: {free}</Text>
              <Text>Location: {title}</Text>
              <Text>Reserved: {reserved ? 'yes' : 'no'}</Text>
              <Image source={image}
              resizeMode="cover"/>
              <Button primary style={styles.subButton} onPress={() => { this.submit() }}><Text>Reserve</Text></Button>
            </Card>
        </View>
      );
    }
  }

  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    map: {
      alignSelf: 'center',
      width: "100%",
      height: "70%",
    },
    submit: {
      height:"30%",
    },
    subButton: {
      alignSelf: "center",
    },
  });