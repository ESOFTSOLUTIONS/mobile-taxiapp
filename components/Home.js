import React, { Component, useEffect, useState } from "./node_modules/react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import * as _ from './node_modules/lodash';
import { callAPI } from '../actions/actions';
import * as Device from "./node_modules/expo-device";
import * as Location from './node_modules/expo-location';

const AppName = 'Taxi 2000';
const DeviceId = Device.deviceName;

// const [location, setLocation] = useState(null);
// const [errorMsg, setErrorMsg] = useState(null);

export default class Home extends Component {

  // compareCurrentPositionWithPrevPosition = (pos1, pos2) => pos1.lat === pos2.lat && pos1.lng === pos2.lng;
  lastLocation = { lat: -1, lng: -1 };

  async loadLocation() {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }

      const deviceType = await Device.getDeviceTypeAsync();
  
      Location.watchPositionAsync({
        accuracy: Location.Accuracy.Highest,
        timeInterval: 10 * 1000,
        distanceInterval: 30,
        mayShowUserSettingsDialog: true
      }, (data) => {
        callAPI({
          deviceId: DeviceId,
          deviceName: `${Device.deviceName}`,
          deviceBrand: `${Device.brand}`,
          deviceType: deviceType,
          lat: data.coords.latitude,
          lng: data.coords.longitude,
          accuracy: data.coords.accuracy,
          speed: data.coords.speed,
          offline: false
        });

        this.lastLocation = {
          lat: data.coords.latitude,
          lng: data.coords.longitude
        };

        console.log(data, ':: Device Location');
      });
      // setLocation(location);
    })();
  }

  componentDidMount() {
    this.loadLocation();
  }

  componentDidUpdate() {
    this.loadLocation();

    Location.hasServicesEnabledAsync()
    .then(isOnline => {
      console.log(isOnline, '::Device Status')
      if (!isOnline) {
        callAPI({
          deviceId: Device.deviceId,
          deviceType: Device.DeviceType,
          lat: this.lastLocation.lat,
          lng: this.lastLocation.lng,
          offline: !isOnline
        });
      }
    })
  }
  
  _onBusyPress(data) {
    const _data = {
      deviceId: Device.deviceId,
      location: {
        lat: 1,
        lng: 2
      },
      offline: true
    };

    callAPI(_data);
  }

  _onAvailPress(data) {
    alert(2);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{ AppName }</Text>
        <TouchableOpacity
          onPress={ ($event) => this._onBusyPress($event) }
          style={[
            styles.button,
            { backgroundColor: "#ee5253", marginBottom: 50 },
          ]}
        >
        <Text style={styles.buttonTitle}>Taxi e Zene</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={ ($event) => { this._onAvailPress($event) } }
          style={[styles.button, { backgroundColor: "#10ac84" }]}>
          <Text style={styles.buttonTitle}>Taxi e Lire</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 75,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonTitle: {
    fontSize: 15,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 50,
    textTransform: "uppercase",
    color: "#8395a7",
  },
});