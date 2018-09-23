import React from 'react';
import { Animated, Text, View, Button } from 'react-native';
export default class Home extends React.Component {


    componentWillMount() {
       
        console.warn("initail state",this.props.status)
    }
  
    test()
    {
        this.props.profile();
        console.warn("after calling action",this.props.status)
    }
    render() {

        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Button title=" Check Props"
                    onPress={() => this.test()}
                />
            </View>
        );
    }
}
