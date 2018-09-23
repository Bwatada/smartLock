import React from 'react';
import { Font } from "expo";
import { Card, Content, Container, Header, Tab, Tabs, TabHeading, Icon, StyleProvider, Toast } from 'native-base';
import { Button } from 'react-native-elements'
import { Col, Row, Grid } from 'react-native-easy-grid';
import { AsyncStorage, StyleSheet, View, Dimensions, Text, Alert, TouchableHighlight} from 'react-native';
import Dash from './Dash.js';
import Settings from './Settings.js';
import Stats from './Stats.js';
import LoginForm from './LoginForm.js';
import MapView, { Marker, ProviderPropType } from 'react-native-maps';
import { Image } from 'react-native';

import { Stopwatch, Timer } from 'react-native-stopwatch-timer'

import { Client, Message } from 'react-native-paho-mqtt';

//MQTT CLIENT
// Create a client instance
const statusImage = require('./src/images/el.jpg');
const myStorage = {
  setItem: (key, item) => {
    myStorage[key] = item;
  },
  getItem: (key) => myStorage[key],
  removeItem: (key) => {
    delete myStorage[key];
  },
};
const stAtus = 'empty';
const client = new Client({ uri: 'ws://104.238.164.118:8083/mqtt/', clientId: 'clientId', storage: myStorage });
 
// set event handlers
client.on('connectionLost', (responseObject) => {
  if (responseObject.errorCode !== 0) {
    console.log(responseObject.errorMessage);
  }
});
client.on('messageReceived', (message) => {
  var msg = message.payloadString;
  if (msg == 'false'){
    stAtus = false;
    Alert.alert(
      'Your bike has been removed from its lock!',
      'If this was you, ignore this message.',
      [
        {text: 'OK', onPress: () => console.log('Ask me later pressed')},
        
      ],
      { cancelable: false }
    )
  } else if(msg == 'true'){
    stAtus = true;
    Alert.alert(
      'Your bike has been placed in its lock!',
      'You can track the status of your bike from your phone..',
      [
        {text: 'OK', onPress: () => console.log('Ask me later pressed')},
        
      ],
      { cancelable: false }
    )
      
  }
  console.log(message.payloadString);
});
 
// connect the client
client.connect()
  .then(() => {
    // Once a connection has been made, make a subscription and send a message.
    console.log('onConnect');
    return client.subscribe('elevate/status');
  })
  .then(() => {
    console.log('connected');
  })
  .catch((responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.log('onConnectionLost:' + responseObject.errorMessage);
    }
  })
;


//APP VARIABLES


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
console.disableYellowBox = true;

const user = {
  email: '123@abc.com',
  password: '123456'
}
export default class App extends React.Component {
  
  constructor(props){
    super(props)
    this.state = {
      //SHOW STOPWATCH
      timerStart: false,
      stopwatchStart: false,
      totalDuration: 10000,
      timerReset: false,
      stopwatchReset: false,
      //MAP
      latitude: 43.659758,
      longitude: -79.388866,
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
              color: "green"
            },
            {
              coordinate:{
                latitude: 43.6619254,
                longitude: -79.3962931,
              },
              title: "Best Bike Rack",
              description: "Slots Available: 9",
              free: 9,
              capacity: 10,
              image: Images[0],
              color: "green"
            },
            {
              coordinate:{
                latitude: 43.6586587,
                longitude: -79.3961308,
              },
              title: "Bad Bike Rack",
              description: "Slots Available: 0",
              free: 0,
              capacity: 4,
              image: Images[0],
              color: "red"
            },
            {
              coordinate:{
                latitude: 43.6518122,
                longitude: -79.4103035,
              },
              title: "Mediocre Bike Rack",
              description: "Slots Available: 0",
              free: 0,
              capacity: 4,
              image: Images[0],
              color: "red"
            },
          ],
          selected: {
            free: 0,
            title: null,
            image: null,
          },
          rack: "No rack selected",
          reserved: false,

          
      //APP
      selectedIndex: 1,
      loggedIn:true,
      refreshSettings: false,
      payload:{},
      placeName: '',
      places: [],
      
      //DASH
      reserved: null,
      detected: null,
    };

    //BIND TIMER
    this.toggleTimer = this.toggleTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.toggleStopwatch = this.toggleStopwatch.bind(this);
    this.resetStopwatch = this.resetStopwatch.bind(this);
    this.updateIndex = this.updateIndex.bind(this)
    global.reserved = false
  }

  //MAP METHODS

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });
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
       var message = new Message('ready')
       message.destinationName = 'elevate/status'
       client.send(message)
      if(!this.state.timerStart) {
        this.toggleTimer();
      }
      if(this.state.stopWatchStart){
        this.toggleStopwatch();
        this.resetStopwatch();
      }
       this.setState(
         {reserved: true,
        detected: true
        
    })
        Alert.alert(
          'Bike Reserved!',
          'Isn\'t that great?',
          [
            {text: 'Yeah, really great!', onPress: () => {stAtus = 'empty'; this.setState({state: this.state})}},
            {text: 'Meh', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: 'Not Really', onPress: () => console.log('OK Pressed')},
          ],
          { cancelable: false }
        )
      
       console.log('you failure', this.state.reserved);
     } else if(this.state.selected.location==null){
      Alert.alert(
        'Select a bike rack first!',
        'You can start by tapping one of the green markers.',
        [
          {text: 'OK', onPress: () => console.log('Ask me later pressed')},
          
        ],
        { cancelable: false }
      )
       console.log("rejected!")
     } else {
      Alert.alert(
        'That bike rack is full!',
        'All spots have been taken.',
        [
          {text: 'Darn', onPress: () => console.log('Ask me later pressed')},
          
        ],
        { cancelable: false }
      )
     }
   }

   //DASH METHODS
   refresh() {
    AsyncStorage.getItem('selected', (err, result) => {
        if (JSON.parse(result) != this.state.selected){
            this.setState({
                selected: JSON.parse(result),
              });
        }
      });
      AsyncStorage.getItem('reserved', (err, result) => {
        console.log(JSON.parse(result).status);
        if(this.state.reserved != JSON.parse(result).status){
            this.setState({
                reserved: JSON.parse(result).status,
              });
        }   
      })
}

//STOPWATCH METHODS
toggleTimer() {
  this.setState({timerStart: !this.state.timerStart, timerReset: false});
}

resetTimer() {
  this.setState({timerStart: false, timerReset: true});
}

toggleStopwatch() {
  this.setState({stopwatchStart: !this.state.stopwatchStart, stopwatchReset: false});
}

resetStopwatch() {
  this.setState({stopwatchStart: false, stopwatchReset: true});
}

getFormattedTime(time) {
    this.currentTime = time;
};
contact() {
  stAtus = 'empty';
  this.setState({
    reserved: false,
    selected: {
    free: 0,
    title: null,
    image: null,
  }})
  this.resetTimer()
  this.resetStopwatch()
  console.log(stAtus);
}
unlock(){
  // console.log('open sesame', this.state.timerStart);
  // if (this.state.timerStart && this.state.reserved){
  //   this.toggleTimer();
  //  }
  //  if (!this.state.stopwatchStart) {
  //    this.toggleStopwatch();
  //  }
  //  if(stAtus != 'empty'){
  //    stAtus = !stAtus;
  //  } else if (stAtus == 'empty') {
  //    stAtus = true;
  //  }
   this.setState({state: this.state});
   if (this.state.timerStart && this.state.reserved){
      this.toggleTimer();
      
     }
     if (!this.state.stopwatchStart) {
       this.toggleStopwatch();
     } else {
      this.resetStopwatch();
     }
}
componentDidMount() {
    this.refresh();
}
   //APP METHODS
  updateIndex (selectedIndex) {
    this.setState({selectedIndex})
  }
  refreshSettings() {
    AsyncStorage.getItem('selected', (err, out) => {
      AsyncStorage.getItem('reserved', (err, result) => {
          this.setState(
            {payload : [JSON.parse(out), JSON.parse(result).status]},
          );  
      })
    });
    
    this.setState({refreshShoeList: !this.state.refreshShoeList})
  } 
    
  componentWillMount() {
    console.log('props',this.props.status)
    AsyncStorage.setItem('reserved', JSON.stringify({status: false}), () => {
      AsyncStorage.getItem('reserved', (err, result) => {
        console.log(result);
      });
    });
    AsyncStorage.setItem('selected', JSON.stringify({
      selected: {
        free: 0,
        title: null,
        image: null,
      }}
    ))
  }
  
  render() {
    //DASH VARIABLES
        var detected = this.state.detected || "No rack occupied";
        var status = false;
        var comment = "No rack occupied";
        
        if (this.state.detected != null) {
            if(stAtus == true) {
                console.log('stat', stAtus)
                comment = "Bike Detected";
                statusImage = require('./src/images/check.png');
            } else if (!stAtus){
                console.log('stat', stAtus)
                comment = "Bike Not Detected!";
                statusImage = require('./src/images/redx.png');
            } else {
              console.log('stat', stAtus)
              comment = "No rack occupied";
              statusImage = require('./src/images/el.jpg');
            }
        }
    //MAP VARIABLES
    var markers = this.state.markers || [];
    var free = this.state.selected.free || "No location selected";
    var title = this.state.selected.title || "No location selected";
    var image = this.state.selected.image || require('./src/images/BS.png');
    var reserved = this.state.reserved;
    var handleTimerComplete = () => {
      Alert.alert(
        'Your reserved time has expired!',
        'Your reservation has been removed.',
        [
          {text: 'Darn', onPress: () => {stAtus = 'empty'; this.resetStopwatch();
          this.resetTimer();
          this.setState({
            reserved: false,
            selected: {
            free: 0,
            title: null,
            image: null,
            }
          })
        }},
          
        ],
        { cancelable: true }
      )
    }
    const buttons = ['Hello', 'World', 'Buttons']
    const { selectedIndex } = this.state
    if(this.state.loggedIn){
      return (
        <Container>
            <Header 
              hasTab
            />
            <Tabs>
              <Tab heading={ <TabHeading><Icon name="home" /></TabHeading>}>
              <Content>
                  <Image resizeMode='contain' source={ require('./src/images/empty.png')} style={
                      styles.logo
                  }/>
                  <Grid style={{paddingRight: 10, paddingLeft: 10}}>
                      <Col style={{ height: 200 , justifyContent: 'center'}}>
                        <View style={{height:'95%', borderWidth: 2.5, borderRadius: 25}}>
                          <Text style={{ alignSelf: "center" }}>Bike Status: </Text>
                          <Text style={{ alignSelf: "center" }}>{comment}</Text>
                          <Image resizeMode='contain' source={statusImage} style={{alignSelf:"center", height:"75%"}}/>
                        </View>
                      </Col>
                      <Col style={{ height: 200, justifyContent: 'center' }}>
                        <View style={{height:'95%', borderWidth: 2.5, borderRadius: 25}}>
                          <Text style={{ alignSelf: "center" }}>Location: </Text>
                          <Text style={{ alignSelf: "center" }}>{title}</Text>
                          <MapView
                            ref={map => {this.map = map}}
                            style={{height:"70%"}}
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
                                    pinColor={marker.color}
                                    onPress={() => { this.onMarkerPress(marker) }}
                                    >
                                  </MapView.Marker>
                                );
                            })}  
                          </MapView>
                        </View>
                      </Col>
                  </Grid>
                    <Button title="Confirm" buttonStyle={{
                      backgroundColor: "#009688",
                      width:"100%",
                    }} onPress={() => { this.unlock() }}></Button>
                    <Button title="Remove Bike" buttonStyle={{
                      backgroundColor: "#009688",
                      width:"100%",
                    }} onPress={() => { this.contact() }}></Button>
              </Content>
              </Tab>
              <Tab heading={ <TabHeading>< Icon name="map"/></TabHeading>}>
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
                        pinColor={marker.color}
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
                <Button 
                title="Reserve"
                buttonStyle={{
                  backgroundColor: "#009688",
                  width:"100%",
                }} onPress={() => { this.submit() }}></Button>
  
              </Card>
          </View>
            </Tab>
            <Tab heading={ <TabHeading><Icon type="MaterialIcons" name="timer" /></TabHeading>}>
              <View style={{justifyContent:"center", width: "100%", height:"100%"}}>
                <Text style={{fontSize: 30, alignSelf:"center"}}>Time Elapsed: </Text>
                <Stopwatch laps msecs start={this.state.stopwatchStart}
                  reset={this.state.stopwatchReset}
                  getTime={this.getFormattedTime}
                  options = {options}
                   />
                <Text style={{fontSize: 25, alignSelf:"center"}}>Time Before Reservation Expires: </Text>
                <Timer totalDuration={this.state.totalDuration} msecs start={this.state.timerStart}
                  reset={this.state.timerReset}
                  handleFinish={handleTimerComplete}
                  getTime={this.getFormattedTime}
                  options = {options}
                   />
              </View>
            </Tab>
          </Tabs>
        </Container>
    )} else {
        return (
          <View style={styles.container}>
          <LoginForm
              getEmail={(text)=> this.setState({email: text})}
              getPassword={(text)=> this.setState({password: text})}
              onButtonPress={()=> {
                if(this.state.email === user.email && this.state.password === user.password)
                  this.setState({loggedIn: true})}
              }/>
          </View>
        )
      }
    } 
    
    
}

const styles = StyleSheet.create({
  header: {
    color: "red",
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#404040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container2: {
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
    backgroundColor:"green"
  },
});

const options = {
  container: {
    alignSelf: "center",
    backgroundColor: '#000',
    padding: 5,
    borderRadius: 5,
    width: 220,
  },
  text: {
    fontSize: 30,
    color: '#FFF',
    marginLeft: 7,
  }
};