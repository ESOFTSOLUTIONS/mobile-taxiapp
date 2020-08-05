import React, { Component } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import * as _ from "lodash"
import * as Device from "expo-device";
import * as Location from "expo-location";
import * as TaskManager from 'expo-task-manager';
import DeviceInfo from 'react-native-device-info';

// actions
import { callAPI } from "../actions/actions";

const AppName = 'Taxi 2020';
const DeviceId = Device.deviceName;
const LOCATION_TASK = 'background-location-driver';

export default class Home extends Component {
  constructor() {
    super();
    this.state = {
      driverId: ''
    }
  }

  lastDeviceData = null;
  locationSettings = {
    accuracy: Location.Accuracy.Highest,
    timeInterval: 10000,
    distanceInterval: 30,
    mayShowUserSettingsDialog: true
  };

  async loadLocation() {    
    let response = await Location.getPermissionsAsync();
    
    if (!response.granted) {
      let reqRes = await Location.requestPermissionsAsync();

      if (!reqRes.granted) {
        setErrorMsg('Permission to access location was denied');
        return;
      }
    }

    const deviceType = await Device.getDeviceTypeAsync();

    const currentLocation = await Location.getCurrentPositionAsync(this.locationSettings);
    const hasTask = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);

    if (!hasTask) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK, this.locationSettings);
    } else {
      // await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    }
    
    this.lastDeviceData = Object.assign({}, {
      deviceId: DeviceId,
      deviceName: `${Device.deviceName}`,
      deviceBrand: `${Device.brand}`,
      deviceType: deviceType,
      lat: currentLocation.coords.latitude,
      lng: currentLocation.coords.longitude,
      accuracy: currentLocation.coords.accuracy,
      speed: currentLocation.coords.speed,
      offline: false,
      background: false
    });

    // call api
    callAPI(this.lastDeviceData);

      
      // setLocation(location);
  }

  componentDidMount() {
    this.setState({
      driverId: DeviceInfo.getUniqueId()
    })
    
    this.loadLocation();
  }

  componentDidUpdate() {  
    Location.hasServicesEnabledAsync().then(isOnline => {
      if (!isOnline && this.lastDeviceData) {
        this.lastDeviceData.offline = true;
        callAPI(this.lastDeviceData);
      }
    })
  }
  
  _onBusyPress(data) {
    //
  }

  _onAvailPress(data) {
    //
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

        <View style={styles.driverInfo}>
          <Text style={styles.driverInfoTxt}>Driver Id: </Text>
          <Text>{this.state.driverId}</Text>
        </View>
      </View>
    );
  }
};

TaskManager.defineTask(LOCATION_TASK, ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    console.log(error, 'TASK ERR');
    return;
  }
  if (data) {
    let { locations } = data;
    console.log(locations, 'RESPONSE TASK');
    // const deviceType = await Device.getDeviceTypeAsync();

    for (const location of locations) {
      callAPI({
        driverId: DeviceInfo.getUniqueId(),
        deviceId: DeviceId,
        deviceName: `${Device.deviceName}`,
        deviceBrand: `${Device.brand}`,
        // deviceType: deviceType,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        offline: false,
        background: true
      });
    }

  }
});

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
  driverInfo: {
    marginTop: 10,
    color: "#8395a7",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  driverInfoTxt: {
    color: "#8395a7",
    fontSize: 18,
    fontWeight: "bold",
  }
});