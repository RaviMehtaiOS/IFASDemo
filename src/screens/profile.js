/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StatusBar, Text, View, Button, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, AsyncStorage} from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';
import BackProfileButton from '../headers/BackProfileButton'
import renderIf from '../resources/utility.js';
import { EventRegister } from 'react-native-event-listeners';
import {showNativeAlert} from '../resources/app_utility.js'
import Profile_Detail from '../components/profile_component.js'
import Profile_Top from '../components/profile_top.js'
import LogoutButton from '../headers/LogoutButton.js'

export default class profile extends Component {

//Navigation Method
static navigationOptions = {
    title: 'Profile',
    headerStyle: { backgroundColor: colors.theme },
    headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
    headerLeft: <BackProfileButton />,
    headerRight: <LogoutButton />,
    gesturesEnabled: false,
};

    constructor(props) {
        super(props);
        this.state = { 
            isLoading: true,
            access_token: '',
            userData: {},
            errorMessage: 'Failed to fetch profile information.'
        }
    }

    async getAccessToken() {
        try {
             const value = await AsyncStorage.getItem('ACCESS_TOKEN');
               if (value !== null) {
                    console.log('VALUE:' + value)
                    this.setState({
                        access_token: value.slice(1, -1),
                    })
                    this.getProfile()
               }else{
                // showNativeAlert('Not logged-In')
               }
            } catch (error) {
                showNativeAlert(error.message)
            }
       }

    componentDidMount(){
        this.getAccessToken()

        //LISTENER FOR BACK BUTTON TAP
        this.listener = EventRegister.addEventListener('BackProfileEvent', (data) => {
            CONSTANTS.TOP_SCREEN = CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING
            CONSTANTS.NAV_COUNT = CONSTANTS.NAV_COUNT - 1
            this.props.navigation.goBack()
            // showNativeAlert(CONSTANTS.NAV_COUNT.toString())
        })

        //LISTENER FOR BACK BUTTON TAP
        this.listener = EventRegister.addEventListener('LogoutEvent', (data) => {
            
            Alert.alert(
                'IFAS',
                'Are you sure you want to logout?',
                [
                  {text: 'Yes', onPress: () => this.logoutAPI() },
                  {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                ],
                { cancelable: false }
            )
        })
    }

    

    componentWillUnmount() {
        EventRegister.removeEventListener(this.listener)
    }

    logoutUser(isButtonPressed=true) {
        if(isButtonPressed == false) {
            showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        }
        
        CONSTANTS.TOP_SCREEN = ''
        this.props.navigation.popToTop()
        CONSTANTS.IS_LOGGED_IN = false
    }

    logoutAPI() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token); 

        fetch(CONSTANTS.BASE + CONSTANTS.LOGOUT , {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          }).then((response) => response.json())
              .then((responseJson) => {

                if(responseJson.code == 1) {
                    this.removeItemValue('ACCESS_TOKEN', true)
                }else{
                    showNativeAlert(CONSTANTS.SWW_MESSAGE)
                }

                    
            })
              .catch((error) => {
                // console.error(error);
                showNativeAlert("Network request failed")
            });
    }

    getProfile() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token); 

        console.log(formData)    

        fetch(CONSTANTS.BASE + CONSTANTS.PROFILE , {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          }).then((response) => response.json())
              .then((responseJson) => {

                if(responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN', false)
                }else{
                    this.setState({
                        isLoading: false,
                        userData: responseJson.data.User,
                    }, function(){
            
                    });
                }

                    
            })
              .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    userData: {},
                    isLoading: false,
                })
            });
    }

    
    async removeItemValue(key, isButtonPressed=true) {
        try {
            await AsyncStorage.removeItem(key);
            this.logoutUser(isButtonPressed)
            return true;
        }
        catch(exception) {
            return false;
        }
    }

    

  render() {

    if(this.state.isLoading == true) {
        return(
            <View style={{paddingVertical: dimensions.sizeRatio * 10}}>
                <ActivityIndicator />
            </View>
        )
    }

    if(Object.keys(this.state.userData).length == 0) {
        return(
            <View style = {{flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI, }}>
                    {this.state.errorMessage}
                </Text>
            </View>
        )
    }
    let middleName = this.state.userData.MIDDLE_NAME == null ? '' : this.state.userData.MIDDLE_NAME  
    return (  
        
        

        <View style={{flex: 1}}>

            <View style={{flex: 0, marginTop: dimensions.sizeRatio * 20}}>
                <Profile_Top name = {this.state.userData.FIRST_NAME + ' ' + middleName + ' ' + this.state.userData.LAST_NAME} email = {this.state.userData.EMAIL} />
            </View>

            <View style={{flex: 0, paddingVertical: dimensions.sizeRatio * 15 , backgroundColor: colors.sessions_bgtheme, marginHorizontal: dimensions.sizeRatio * 25, marginTop: dimensions.sizeRatio * 25, borderRadius: dimensions.sizeRatio * 10, shadowColor: '#000000',
                shadowOffset: {
                    width: 0,
                    height: 0
                },
                shadowRadius: 3,
                shadowOpacity: 0.4 }}>

                <Profile_Detail title = 'Username' value = {this.state.userData.USER_NAME} imagePath = {require('../images/user_profile.png')} />
                <Profile_Detail title = 'Phone' value = {this.state.userData.PHONE} imagePath = {require('../images/phone.png')} />
                <Profile_Detail title = 'Course' value = {this.state.userData.COURSE_NAME} imagePath = {require('../images/address.png')} />
                <Profile_Detail title = 'State' value = {this.state.userData.STATE} imagePath = {require('../images/location.png')} />
                <Profile_Detail title = 'District' value = {this.state.userData.DISTRICT} imagePath = {require('../images/location.png')} />
            </View>
        </View>   
        
    );
  }

}

