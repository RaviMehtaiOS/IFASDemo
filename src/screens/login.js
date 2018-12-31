/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, ActionSheetIOS,Text, ScrollView,StatusBar,AsyncStorage, View, Linking, Image, TouchableOpacity, TextInput, Alert, ActivityIndicator} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import styles from '../styles/login_style.js';
import renderIf from '../resources/utility.js';
import {showNativeAlert} from '../resources/app_utility.js'
import CONSTANTS from '../resources/constants.js'
import base64 from 'react-native-base64'
import call from 'react-native-phone-call'
import email from 'react-native-email'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});


let isPermissionAlertVisible = false
export default class login extends Component {

//Navigation Method
    static navigationOptions = {
        title: 'Login',
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            username: '', 
            password: '',
            currentFocus: 'none',
            isLoading: false,
            userToken: '',
            args: {
                number: CONSTANTS.ADMIN_PHONE, // String value with the number to call
                prompt: false // Optional boolean property. Determines if the user should be prompt prior to the call 
              }
        };
      }

      

      componentDidMount() {
        // this.getUserToken()
      }

      async getUserToken() {
            try {
                 const value = await AsyncStorage.getItem(this.state.username);
                   if (value !== null) {
                        console.log("USER TOKEN = " + value) 
                        console.log(base64.decode(value))
                        this.setState({
                            userToken: base64.decode(value)
                        }, () => this.hitLoginAPI() )
                   }else{
                        console.log("NO USER TOKEN")
                        this.setState({
                            userToken: ''
                        }, () => this.hitLoginAPI() )
                   }

                } catch (error) {
                    showNativeAlert(CONSTANTS.SWW_MESSAGE)
              }
        }
      
      

    focusUpdate(textInputId) {
        if(textInputId == "0") {
            this.setState({
                currentFocus: 'username'
            })
        }else{
            this.setState({
                currentFocus: 'password'
            })
        }
    }

    noFocus() {
        this.setState({
            currentFocus: 'none'
        })
    }

    validateEmail = (username) => {
        // let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
        // if(reg.test(email) === false) {
        //     return false;
        // }
        // else {
        //     return true
        // }

        var txtLength = username.length;
        if(txtLength<6){
            return true;
        }else{
            return false;
        }

    };

    validatePassword = (password) => {
        var txtLength = password.length;
        if(txtLength<6){
            return true;
        }else{
            return false;
        }
    };

    validateLoginCredentials() {
        if(this.state.username == '') {
            showNativeAlert('Username cannot be blank')
            // Alert.alert('Username cannot be blank')
        }else if (this.validateEmail(this.state.username)) {
            showNativeAlert('Username should be greater than or equal to 6 characters');
        }else if(this.state.password == '') {
            showNativeAlert('Password cannot be blank')
        }else if (this.validatePassword(this.state.password)) {
            showNativeAlert('Password should be greater than or equal to 6 characters')
        }else {
            this.getUserToken()
        }
    }

    async setValue() {
        await AsyncStorage.setItem('ACCESS_TOKEN', JSON.stringify(responseJson.data.ACCESS_TOKEN));
    }


    async storeItem(Accesskey, Accessitem, statusKey, statusItem) {
        try {
            //we want to wait for the Promise returned by AsyncStorage.setItem()
            //to be resolved to the actual value before returning the value
            var jsonOfAccess = await AsyncStorage.setItem(Accesskey, JSON.stringify(Accessitem));
            var jsonOfStatus = await AsyncStorage.setItem(statusKey, JSON.stringify(statusItem));

            CONSTANTS.IS_LOGGED_IN = true

            if(statusItem == 1) {
                this.moveToSession()
            }else{
                this.moveToCourses()
            }
            

        } catch (error) {
          console.log(error.message);
        }
      }


      async storeUserToken(key, value) {
        try {
            //we want to wait for the Promise returned by AsyncStorage.setItem()
            //to be resolved to the actual value before returning the value
            console.log("BEFORE ENCODING " + value)
            console.log("AFTER ENCODING " + base64.encode(value))
            var jsonOfAccess = await AsyncStorage.setItem(key, base64.encode(value));

        } catch (error) {
          console.log(error.message);
        }
      }

      callAdmin = () => {
        // showNativeAlert("Call")
            call(this.state.args).catch(console.error)
      };


      emailAdmin = () => {
        const to = [CONSTANTS.ADMIN_EMAIL] // string or array of email addresses
        email(to, {
            // Optional additional arguments
            subject: 'Subject',
            body: 'Text Message'
        }).catch(console.error)
      };
      
      

    showContactAlert = (message='') => {
        if (isPermissionAlertVisible) {
            return
        }
if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions({
        title:'IFAS',
        message:message,
        options: ['📱 Call admin', ' 📧 Email admin','Cancel'],
          cancelButtonIndex: 2,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) { this.callAdmin() }
        if (buttonIndex === 1) { this.emailAdmin()  }
        if (buttonIndex === 2) { isPermissionAlertVisible  = false}
      });

}else {
    Alert.alert(
        'IFAS',
        message,
        [
          {text: 'Call admin', onPress: () => this.callAdmin() },
          {text: 'Email admin', onPress: () => this.emailAdmin() },
          {text: 'Cancel', onPress: () => isPermissionAlertVisible = false, style: 'cancel'},
        ],
        { cancelable: false }
    )
}

      

    };

    

    hitLoginAPI() {

        this.setState({
            isLoading: true
        })

        console.log("Device Token: " + CONSTANTS.DEVICE_TOKEN)
        console.log("User Token: " + this.state.username)

        // Alert.alert(CONSTANTS.BASE + CONSTANTS.POST_LOGIN)
        fetch(CONSTANTS.BASE + CONSTANTS.POST_LOGIN, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password,
                device_token: CONSTANTS.DEVICE_TOKEN,
                device_type: Platform.OS === 'ios' ? CONSTANTS.iOS : CONSTANTS.ANDROID,
                user_device_token: this.state.userToken,
            }),
          }).then((response) => response.json())
              .then((responseJson) => {

                console.log(responseJson)


                this.setState({
                    isLoading: false,
                })

                if(responseJson.data.ACCESS_TOKEN == null) {

                    if(responseJson.code == "213") { //LOGGED INTO ANOTHER DEVICE
                      this.showContactAlert(responseJson.message)
                        isPermissionAlertVisible = true
                    }else{
                        showNativeAlert(responseJson.message)
                    }

                    
                }else{
                    this.storeUserToken(this.state.username, responseJson.data.USER_DEVICE_TOKEN)
                    this.storeItem('ACCESS_TOKEN', responseJson.data.ACCESS_TOKEN, 'COURSE_PAYMENT_STATUS', responseJson.data.COURSE_PAYMENT_STATUS)                      
                }
                
              })
              .catch((error) => {
                // console.error(error);
                showNativeAlert("Network request failed")
            });

    }

    moveToSession() {
        this.props.navigation.navigate('Sessions')
    }

    moveToCourses() {
        CONSTANTS.NAV_COUNT = 0
        this.props.navigation.navigate('CoursesUnpaid')
    }

    methodGoBack() {
        this.props.navigation.goBack()
    }

  render() {

    return (

            <View style={{flex: 1}}>

                {/* Status Bar */}
                {renderIf(Platform.OS != 'ios', 
                    <StatusBar
                        barStyle="dark-content"
                        backgroundColor={colors.theme}
                    />
                )}

                {renderIf(Platform.OS == 'ios', 
                    <StatusBar
                        barStyle="dark-content"
                        // backgroundColor='transparent'
                    />
                )}

                <Image source={require('../images/login_bg.png') } style={{
                                flex: 1,
                                width: null,
                                height: null,
                                resizeMode: 'cover',
                                backgroundColor: colors.theme}} />
                
                <View style={{position: 'absolute', width: dimensions.width, height: dimensions.height, backgroundColor: 'transparent'}} >
                <KeyboardAwareScrollView enableResetScrollToCoords={true} contentContainerStyle={{flex: 1}} enableOnAndroid={true} innerRef={ref => {this.scroll = ref}}>
                    {/* TOP VIEW */}
                    <View style={{width: dimensions.width, height: dimensions.height * 0.48, backgroundColor: 'transparent'}}>
                        <View style={{flex: 0.85, backgroundColor: 'transparent'}}>
                            <View style={{flex: 1, justifyContent: 'center'}}>
                                <View style={{marginLeft: dimensions.sizeRatio * 10,backgroundColor: 'transparent', width: dimensions.sizeRatio * 40, height: dimensions.sizeRatio * 40}}>
                                    <TouchableOpacity onPress={() => this.methodGoBack() } style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                        <Image
                                            source={require('../images/back.png')}
                                            style={{ width: dimensions.sizeRatio * 10, height: dimensions.sizeRatio * 15}}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={{flex: 1.0, flexDirection: 'row', backgroundColor: 'transparent'}}>
                            <View style={{flex: 0.35, backgroundColor: 'transparent'}}>

                            </View>
                            <View style={{flex: 0.30}}>
                                <Image source={require('../images/logo.png') } style={{
                                    flex: 1,
                                    width: null,
                                    height: null,
                                    resizeMode: 'contain'}} />
                            </View>
                            <View style={{flex: 0.35, backgroundColor: 'transparent'}}>

                            </View>
                        </View>

                        <View style={{flex: 0.25, backgroundColor: 'transparent'}}>

                        </View>
                    </View>    
                    {/* TOP VIEW END*/}

                    {/* BOTTOM VIEW */}
                    
                    <View style={{width: dimensions.width, height: dimensions.height * 0.52, backgroundColor: 'transparent', paddingHorizontal: dimensions.sizeRatio * 25}}>
                        
                        {/* Username text */}
                        <View style={{flex: 0.6, backgroundColor: 'transparent',  paddingBottom: dimensions.sizeRatio * 2.5}}>
                            <View style={{flex: 1, }}>
                                <Text style={this.state.currentFocus == 'username' ? styles.username_text_focussed : styles.username_text}>
                                    Username
                                </Text>
                            </View>
                        </View>

                        {/* Username Input */}
                        <View style={{flex: 1.5,  backgroundColor: 'transparent',}}>
                            <View style={this.state.currentFocus == 'username' ?  styles.username_new_view_focussed : styles.username_new_view}>
                                <View style={{flex: 1.5, backgroundColor: 'transparent'}}>
                                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                        <Image source={this.state.currentFocus == 'username' ? require('../images/user_active.png') : require('../images/user_inactive.png')} style={{width: dimensions.sizeRatio * 15, height: dimensions.sizeRatio * 16}}/>
                                    </View>
                                </View>
                                <View style={{flex: 8.5, backgroundColor: 'transparent'}}>
                                    <View style={{flex: 1}}>
                                        <TextInput style={{flex: 1, color: 'white', fontSize: dimensions.sizeRatio * 17, fontFamily: CONSTANTS.REGULAR, paddingTop: 0,paddingBottom: 0}} 
                                        
                                            placeholder="Username" placeholderTextColor='#495F8E'
                                            onChangeText = {(username) => this.setState({username})}
                                            onFocus = {() => this.focusUpdate("0")}
                                            onBlur={ () => this.noFocus() }
                                            blurOnSubmit={false}
                                            keyboardType = "email-address"
                                            returnKeyType = "next"
                                            autoCapitalize = "none"
                                            autoCorrect = {false}
                                            scrollEnabled = {false}
                                            ref={(input) => this.usernameInput = input}
                                            onSubmitEditing = {() => { this.passwordInput.focus() }        
                                        }
                                        
                                        />

                                        
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Space */}
                        <View style={{flex: 0.6, backgroundColor: 'transparent',}}></View>

                        {/* Password Text */}
                        <View style={{flex: 0.6, backgroundColor: 'transparent',   paddingBottom: dimensions.sizeRatio * 2.5}}>
                            <View style={{flex: 1, }}>
                                <Text style={this.state.currentFocus == 'password' ? styles.password_text_focussed : styles.password_text}>
                                    Password
                                </Text>
                            </View>
                        </View>

                        <View style={{flex: 1.5, backgroundColor: 'transparent',}}>
                            <View style={this.state.currentFocus == 'password' ? styles.password_new_view_focussed : styles.password_new_view}>
                                <View style={{flex: 1.5, backgroundColor: 'transparent'}}>
                                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                        <Image source={this.state.currentFocus == 'password' ? require('../images/password_active.png') : require('../images/password_inactive.png')} style={{width: dimensions.sizeRatio * 17, height: dimensions.sizeRatio * 17}}/>
                                    </View>
                                </View>
                                <View style={{flex: 8.5, backgroundColor: 'transparent'}}>
                                    <View style={{flex: 1}}>
                                        <TextInput style={{flex: 1, color: 'white', fontSize: dimensions.sizeRatio * 17, fontFamily: CONSTANTS.REGULAR, paddingTop: 0,paddingBottom: 0}} 
                                        
                                            secureTextEntry={true}  
                                            placeholder="Password" placeholderTextColor='#495F8E'
                                            scrollEnabled = {false}
                                            onChangeText = {(password) => this.setState({password})}
                                            onFocus = {() => this.focusUpdate("1")}
                                            onBlur = {() => this.noFocus()}
                                            ref={(input) => this.passwordInput = input}
                                        
                                        />
                                            
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Forgot Password */}
                        <View style={{flex: 1.5, backgroundColor: 'transparent',}}>
                            <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-start'}}>
                                <TouchableOpacity onPress={ ()=>{ Linking.openURL('http://ifasonline.com/pwdManagement.jsp')}}>
                                   <Text style={{fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 13, color: colors.fb_text}}>Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* SIGN IN Button */}
                        <View style={{flex: 1.5, backgroundColor: 'transparent',}}>
                            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: dimensions.sizeRatio * 7}} >
                                <TouchableOpacity onPress={() => this.validateLoginCredentials() }  hitSlop={{top: dimensions.sizeRatio * 20, bottom: dimensions.sizeRatio * 20, left: dimensions.sizeRatio * 100, right: dimensions.sizeRatio * 100}}>
                                    <Text style={{fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 15, color: colors.theme}}>SIGN IN</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{flex: 3.2, backgroundColor: 'transparent',}}>
                            {renderIf(this.state.isLoading, 
                                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', top: dimensions.sizeRatio * -15}}>
                                    <ActivityIndicator/>
                                </View>
                            )}
                        </View>

                    </View> 
                    {/* BOTTOM VIEW END */}
                    </KeyboardAwareScrollView>
                </View>

                

            </View>

            

          
        
    );
  }
}



