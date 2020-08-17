import React, { Component } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Image } from "react-native";
import * as _ from "lodash"
import * as Device from "expo-device";
import * as Location from "expo-location";
import * as TaskManager from 'expo-task-manager';
import DeviceInfo from 'react-native-device-info';

// actions
import { callAPI } from "../actions/actions";

const AppLogo = require('~/../../assets/img/logo.png');
const AppName = 'Taxi 2020';
const DeviceId = Device.deviceName;
const LOCATION_TASK = 'background-location-driver';

export default class Home extends Component {
  lastTime = +new Date();

  constructor() {
    super();
    const initTime = +new Date();
    this.state = {
      driverId: '',
      location: { latitude: 0, longitude: 0 },
      fetchTime: initTime,
      deviceOnline: true
    }
  }

  lastDeviceData = null;

  locationSettings = {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 10000,
    distanceInterval: 1, // 10 meters distance
  };


  componentDidMount() {
    // get current device id
    this.setState({ driverId: DeviceInfo.getUniqueId() });

    this.askPermissions().then(() => {
      this.getLocation();

      // enable network to correct location
      Location.enableNetworkProviderAsync().then(() => {
        this.setState({ deviceOnline: true });
        this.watchLocation();
      })
      .catch(err => {
        alert(JSON.stringify(err));
      })    
    });

    Location.hasServicesEnabledAsync().then(isOnline => {
      if (!isOnline && this.lastDeviceData) {
        this.setState({ deviceOnline: false });
        callAPI(this.lastDeviceData);
      }
    })
  }

  async watchLocation() {
    Location.watchPositionAsync(this.locationSettings, async (currentLocation) => {
      // get current location
      this.lastDeviceData = await this.getLastDeviceData(currentLocation)
      
      // call api
      callAPI(this.lastDeviceData);
    });

  }

  async getLocation() {    
    const hasTask = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);

    if (!hasTask) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK, this.locationSettings);
    }    
  }

  async getLastDeviceData(currentLocation) {
    const deviceType = await Device.getDeviceTypeAsync();
    
    // const prevState = {...this.state};
    
    // store current location
    this.setState({ location: currentLocation.coords, fetchTime: +new Date() });
    
    // const offline = this._checkPreviousLocTime(prevState);

    return Promise.resolve({... {
      driverId: DeviceInfo.getUniqueId(),
      deviceId: DeviceId,
      deviceName: `${Device.deviceName}`,
      deviceBrand: `${Device.brand}`,
      deviceType: deviceType,
      lat: currentLocation.coords.latitude,
      lng: currentLocation.coords.longitude,
      accuracy: currentLocation.coords.accuracy,
      speed: currentLocation.coords.speed,
      offline: false,
      background: false,
      fetchTime: +new Date() // timestamp
    }});
  }

  async askPermissions() {
    // ask for permissions
    let response = await Location.getPermissionsAsync();
    
    if (!response.granted) {
      let reqRes = await Location.requestPermissionsAsync();

      if (!reqRes.granted) {
        setErrorMsg('Permission to access location was denied');
        return;
      }
    }
  }
  
  _onBusyPress(data) {
    //
  }

  _onAvailPress(data) {
    //
  }

  _checkPreviousLocTime(prevState) {
    const decimalLen = 8;
    const currLat = String(this.state.location.latitude).substring(0, decimalLen);
    const prevLat = String(prevState.location.latitude).substring(0, decimalLen);
  
    const currLng = String(this.state.location.longitude).substring(0, decimalLen);
    const prevLng = String(prevState.location.longitude).substring(0, decimalLen);

    const timeDiff = this.state.fetchTime - this.lastTime;
    
    let offline = false;
  
    if (currLat === prevLat && currLng === prevLng) {
      offline = true;
      if (timeDiff > 60) {
        this.setState({ deviceOnline: false });
      }
    } else if (!this.state.deviceOnline) {
      offline = false;
      this.setState({ deviceOnline: true });
      this.lastTime = +new Date();
    }

    return offline;
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.appLogo} source={AppLogo}></Image>
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}

        <View style={styles.driverInfo}>
          <Text style={styles.driverInfoTxt}>Driver Id: </Text>
          <Text>{this.state.driverId}</Text>
          <Text style={styles.driverInfoTxt}>
              Location: (lat, lng)
          </Text>
          <Text style={styles.driverInfoTxt}>
            {this.state.location.latitude}, {this.state.location.longitude}
          </Text>
        </View>
      </View>
    );
  }
};

/**
 * TASK FOR BACKGROUND FETCH DATA
 */
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    console.log(error, 'TASK ERR');
    return;
  }
  if (data) {
    let { locations } = data;

    const home = new Home();
    // get current location
     home.getLastDeviceData(locations[locations.length - 1]).then(lastDeviceData => {
       if (lastDeviceData) {
         lastDeviceData['background'] = true;
         callAPI(lastDeviceData);
       }
    });
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
  },
  appLogo: {
    width: 200
  }
  
});