import React from 'react';
import { Image, AsyncStorage, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Button, Content } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
export default class Settings extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            reserved: null,
            selected: {
            },
            detected: null,
        }

    }
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
    componentDidMount() {
        this.refresh();
    }
    componentWillReceiveProps(props) {
        console.log('props', this.props);
      }
    render() {
        var free = this.state.selected.free || "No rack occupied";
        var title = this.state.selected.title || "No rack occupied";
        var image = this.state.selected.image ||"";
        var reserved = this.state.reserved;
        var detected = this.state.detected || "No rack occupied";
        var status = false;
        var image = require('./src/images/empty.png');
        var comment = "No rack occupied";
        if (this.state.detected != null) {
            status = true;
            if(this.state.detected) {
                comment = "Bike Detected";
                image = require('./src/images/check.png');
            } else {
                comment = "Bike Not Detected!";
                image = require('./src/images/redx.png');
            } 
        }
        return(
            <Content>
                <Image resizeMode='contain' source={image} style={
                    styles.logo
                }/>
                <Grid>
                    <Col style={{ backgroundColor: '#635DB7', height: 200 }}><Text>Bike Status: {comment}</Text></Col>
                    <Col style={{ backgroundColor: '#00CE9F', height: 200 }}><Text>Location: {title}</Text></Col>
                </Grid>
                <Button full><Text>Unlock</Text></Button>
                <Button full><Text>Contact</Text></Button>
            </Content>
        )
    }
}

const styles = StyleSheet.create({
    logo: {
      }
  });
