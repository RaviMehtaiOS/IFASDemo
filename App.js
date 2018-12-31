/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, ActivityIndicator,YellowBox, Alert, PushNotificationIOS} from 'react-native';
import LoginScreen from './src/screens/login';
import FreeVideosScreen from './src/screens/free_videos';
import SessionsScreen from './src/screens/sessions';
import SubjectsScreen from './src/screens/subjects';
import TopicsScreen from './src/screens/topics';
import CoursesScreen from './src/screens/courses';
import VideoStreamingScreen from './src/screens/video_streaming'
import ProfileScreen from './src/screens/profile'
import CoursesUnpaidScreen from './src/screens/courses_unpaid'
import VideoPlayerScreen from './src/screens/video_player'

import { StackNavigator } from 'react-navigation'
import SplashScreen from 'react-native-splash-screen'
import constants from './src/resources/constants';
import { showNativeAlert } from './src/resources/app_utility';

import firebase from 'react-native-firebase';
import type { RemoteMessage } from 'react-native-firebase';
import type { Notification, NotificationOpen } from 'react-native-firebase';

import { EventRegister } from 'react-native-event-listeners';
import Orientation from 'react-native-orientation';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});


export default class App extends Component {

  constructor(props){
      super(props);
      this.state = {
        timePassed: false
      };
  }

  componentDidMount() {
    constants.APP_HAS_LAUNCHED = true
 
     
    
    Orientation.lockToPortrait();


    let that = this;
    if(Platform.OS == 'ios') {
      setTimeout(function(){that.setState({timePassed: true})}, 5000);
    }else{
      setTimeout(function(){that.setState({timePassed: true})}, 5000);
    }


    
    firebase.messaging().hasPermission()
      .then(enabled => {
        if (enabled) {
          // user has permission
          this.getToken()
        } else {
          // user doesn't have permission
          this.requestPermission()
        } 
    });

    //Monitor token generation
    this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
      // showNativeAlert("Token Refresh: " + fcmToken)
      constants.DEVICE_TOKEN = fcmToken
    });

    this.messageListener = firebase.messaging().onMessage((message: RemoteMessage) => {
      console.log("onMessage received" + message)
    });

    
    this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification: Notification) => {
      console.log("onNotificationDisplayed" + notification)
      // Process your notification as required
      // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
    });

    //ANDROID: called when app is in foregorund
    this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
      console.log(notification)  
      // Process your notification as required
      if(constants.IS_LOGGED_IN == true) {
        // showNativeAlert(notification.body)
        let data = JSON.parse(notification.data.data)
        // console.log("relData: " + JSON.stringify(relData))
        console.log("Video URL: " + data.relData.video_url)  
        if(data.relData.video_url.trim() != '') {
          constants.VIDEO_URL = data.relData.video_url.trim()
        }else{
          constants.VIDEO_URL = ""
        }
        Alert.alert(
          'IFAS',
          data.message,
          [
            {text: 'Ok', onPress: () => EventRegister.emit('Notification_Received', '') },
            // {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          ],
          { cancelable: false }
        )


        // EventRegister.emit('Notification_Received', '')
      }
    });

    //ANDROID: called notification is tapped when app is in background
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
      
      // Get the action triggered by the notification being opened
      const action = notificationOpen.action;
      // Get information about the notification that was opened
      const notification: Notification = notificationOpen.notification;
      console.log(notification)
      // console.log("onNotificationOpened Action: " + action)
      // showNativeAlert("App open from background")
      if(constants.IS_LOGGED_IN == true) {

        const data = JSON.parse(notification.data.data)
        // showNativeAlert(relData.message)
        if(data.relData.video_url.trim() != '') {
          constants.VIDEO_URL = data.relData.video_url.trim()
        }else{
          constants.VIDEO_URL = ""
        }

        Alert.alert(
          'IFAS',
          data.message,
          [
            {text: 'Ok', onPress: () => EventRegister.emit('Notification_Received', '') },
            // {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          ],
          { cancelable: false }
        )



        // console.log(relData.message);
        
      }
  });

    firebase.notifications().getInitialNotification()
      .then((notificationOpen: NotificationOpen) => {
        console.log("getInitialNotification")
        if (notificationOpen) {
          // App was opened by a notification
          // Get the action triggered by the notification being opened
          const action = notificationOpen.action;
          // Get information about the notification that was opened
          const notification: Notification = notificationOpen.notification;  
        }
      });
    
  }

  componentWillUnmount() {
    this.onTokenRefreshListener();
    this.notificationDisplayedListener();
    this.notificationListener();
    this.notificationOpenedListener();
  }

  requestPermission() {
    firebase.messaging().requestPermission()
      .then(() => {
        // User has authorised 
        this.getToken()
      
      })
      .catch(error => {
        // User has rejected permissions  
      });
  }

  getToken() {
    firebase.messaging().getToken()
      .then(fcmToken => {
        if (fcmToken) {
          // user has a device token
          console.log("DEVICE_TOKEN: " + fcmToken)
          constants.DEVICE_TOKEN = fcmToken
          // showNativeAlert(fcmToken)
        } else {
          // user doesn't have a device token yet
          // showNativeAlert("NO device token")
        } 
      });
  }


  render() {
    console.disableYellowBox = true;

    if(this.state.timePassed == true) {
      // if(Platform.OS == 'android') {
          SplashScreen.hide();
      // }
      
      return (
        // <View>
        //   <StatusBar
        //     backgroundColor="blue"
        //     barStyle="dark-content"
        //   />

          <PrimaryNav />
        // </View>
        
      );
    }else{
      return (
        <ActivityIndicator />
      );
    }

    
  }

}

const PrimaryNav = StackNavigator({
  Courses: { screen: CoursesScreen },
  FreeVideos: { screen: FreeVideosScreen },
  Login: { screen: LoginScreen },
  Sessions: {screen: SessionsScreen},
  Subjects: {screen: SubjectsScreen},
  CoursesUnpaid: { screen: CoursesUnpaidScreen },
  Topics: {screen: TopicsScreen},
  VideoStreaming: {screen: VideoStreamingScreen},
  VideoPlayer: {screen: VideoPlayerScreen},
  Profile: {screen: ProfileScreen},
});



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
