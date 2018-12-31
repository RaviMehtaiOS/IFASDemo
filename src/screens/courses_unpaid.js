/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {AppState, Platform, StatusBar, Text, View, Linking, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, AsyncStorage, BackHandler} from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';
import styles from '../styles/courses_style.js';
import renderIf from '../resources/utility.js';
import {showNativeAlert} from '../resources/app_utility.js';
import PaymentHeaderButton from '../headers/PaymentHeaderButton';
import { EventRegister } from 'react-native-event-listeners';



const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});




export default class courses_unpaid extends Component {

    //Navigation Method
    static navigationOptions = {
        title: 'Select Course',
        gesturesEnabled: false,

        headerTitleStyle: {
            // fontWeight: '200',
            // color: '#2c38ff',
            textAlign: 'center',
            flex: 1,
          },
        headerLeft: null,
        headerRight: <PaymentHeaderButton />, //Add here
    };


    

    constructor(props) {
        super(props);
        this.state = { 
            isLoading: true,
            isLoggedIn: false,
            dataSource: [],
            errorMessage: 'Failed to fetch courses list.',
            appState: AppState.currentState,
        }

        this.backButtonListener = null;

        // showNativeAlert(this.state.appState)
    }

    methodGoToTopics(itemId) {
        // Alert.alert(itemId.toString())
        CONSTANTS.NAV_COUNT = 1
        this.props.navigation.navigate('FreeVideos', { courseId: itemId.toString(), hideLogin: true })
    }





    //the functionality of the retrieveItem is shown below
    async retrieveItem(key) {
        try {
            const retrievedItem =  await AsyncStorage.getItem(key);
            const item = JSON.parse(retrievedItem);
            return item;
        } catch (error) {
        console.log(error.message);
        }
        return
    }

    async loginStatus() {
        try {
             const value = await AsyncStorage.getItem('ACCESS_TOKEN');
               if (value !== null) {
                  // We have data!!
                    this.getCourses()
               }else{
                    this.getCourses()
               }
            } catch (error) {
                // Error retrieving data
                this.getCourses()
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
                console.log(responseJson)
                if(responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                }else{
                    this.storeItem('ACCESS_TOKEN', this.state.access_token, 'COURSE_PAYMENT_STATUS', responseJson.data.User.COURSE_PAYMENT_STATUS)
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
     async storeItem(Accesskey, Accessitem, statusKey, statusItem) {
        try {
            //we want to wait for the Promise returned by AsyncStorage.setItem()
            //to be resolved to the actual value before returning the value
            var jsonOfAccess = await AsyncStorage.setItem(Accesskey, JSON.stringify(Accessitem));
            var jsonOfStatus = await AsyncStorage.setItem(statusKey, JSON.stringify(statusItem));

            CONSTANTS.IS_LOGGED_IN = true

            if(statusItem == 1) {
                this.moveToSession()
            }
         } catch (error) {
          console.log(error.message);
        }
      }

    moveToSession() {
        this.unsubscribeAllEvents()
        this.props.navigation.navigate('Sessions')
    }

    async removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            this.logoutUser()
            return true;
        }
        catch(exception) {
            return false;
        }
    }

    logoutUser() {
        this.unsubscribeAllEvents()
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        CONSTANTS.TOP_SCREEN = ''
        this.props.navigation.popToTop()
        CONSTANTS.IS_LOGGED_IN = false
    }
       

       _handleAppStateChange = (nextAppState) => {
            
        if ((this.state.appState === 'background' ||  this.state.appState === 'inactive') && nextAppState === 'active') {
        //   showNativeAlert('App has come to the foreground!')
            // this.unsubscribeAllEvents()
            this.getAccessToken()
        }
        this.setState({appState: nextAppState});
      }

      methodGoToSessions() {
        this.props.navigation.navigate('Sessions')
    }

    componentDidMount(){
        this.loginStatus()

        //LISTENER FOR APP STATE
        AppState.addEventListener('change', this._handleAppStateChange);

        //LISTENER FOR PAYMENT BUTTON TAP
        this.listener = EventRegister.addEventListener('PaymentEvent', (data) => {
            Linking.openURL('http://ifasonline.com/register.jsp')
        })
         if (CONSTANTS.APP_HAS_LAUNCHED == true) {
            CONSTANTS.APP_HAS_LAUNCHED = false
          this.getAccessToken()
        }
        //LISTENER FOR PROFILE BUTTON TAP
        this.listener = EventRegister.addEventListener('ProfileEvent', (data) => {
            // CONSTANTS.TOP_SCREEN = 'PROFILE'
            // CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING = 'SESSIONS'
            CONSTANTS.NAV_COUNT = 1
            this.props.navigation.navigate('Profile')
            
        })


        this.backButtonListener = BackHandler.addEventListener('hardwareBackPress', function() {
            // showNativeAlert(CONSTANTS.NAV_COUNT.toString())

            if(CONSTANTS.NAV_COUNT <= 0) {
                CONSTANTS.NAV_COUNT = 0
                // showNativeAlert('EXIT BHAI')
                if(CONSTANTS.IS_LOGGED_IN == true) {
                    Alert.alert(
                        'EXIT APP',
                        'Are you sure you want to exit the app?',
                        [
                        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                        {text: 'OK', onPress: () => BackHandler.exitApp() },
                        ],
                        { cancelable: false }
                    )
                    return true
                }else{
                    return false
                }
                
            }else{

                CONSTANTS.NAV_COUNT = CONSTANTS.NAV_COUNT - 1
                // showNativeAlert(CONSTANTS.NAV_COUNT.toString())
                return false
            }
            
            return true
        });
    }

    unsubscribeAllEvents() {
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.backButtonListener.remove();
        EventRegister.removeEventListener(this.listener)
    }

    componentWillUnmount() {
        this.unsubscribeAllEvents()
    }
    

      getCourses() {
        return fetch(CONSTANTS.BASE + CONSTANTS.GET_COURSES)
          .then((response) => response.json())
          .then((responseJson) => {
            // showNativeAlert(responseJson.message)
            if(responseJson.code == 1) { //SUCCESS
                this.setState({
                    isLoading: false,
                    dataSource: responseJson.data.Courses,
                  }, function(){
          
                  });
                
            }else{
                this.setState({
                    isLoading: false,
                  }, function(){
          
                  });
            }

          })
          .catch((error) =>{
         console.error(error);
                // showNativeAlert('Network request failed')
                this.setState({
                    dataSource: [],
                    isLoading: false,
                })
          });
      }

    renderActivityIndicator() {
        return (
            <View style={{flex: 1, padding: 20}}>
                <ActivityIndicator/>
            </View>
        )
    }

    renderBottomView() {

        return (
            <View style={{height: ((dimensions.sizeRatio) * 100), flexDirection: 'row', backgroundColor: colors.theme}}>
            {/* Left Row */}
                <View style={{flex: 1, backgroundColor: 'transparent', paddingLeft: (dimensions.sizeRatio * 15), paddingTop: (dimensions.sizeRatio * 30)}}> 
                    <Text style={{fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.white, fontFamily: CONSTANTS.DEMI}}>
                        Welcome Back!
                    </Text>
                    <Text style={{fontSize: (dimensions.sizeRatio * 11), textAlignVertical: "center", color: colors.white, fontFamily: CONSTANTS.REGULAR}}>
                        There is a lot to learn
                    </Text>
                </View>
                {/* Right Row */}
                <View style={{flex: 1, backgroundColor: 'transparent', justifyContent: "center", alignItems: "center"}}>
                    <TouchableOpacity onPress={() => this.methodGoToLogin() } style={{height: dimensions.sizeRatio * 51, width: dimensions.sizeRatio * 145, backgroundColor: colors.white, borderRadius: dimensions.sizeRatio * 5}}>
                        <Text style={Platform.OS == 'ios' ? styles.signin_text_ios : styles.signin_text_android}>SIGN IN</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    renderFlatList() {

        if(this.state.dataSource.length == 0) {
            return(
                <View style = {{flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI, color: colors.theme}}>
                        {this.state.errorMessage}
                    </Text>
                </View>
            )
        }else{
            return (

                <View style={{flex: 1, backgroundColor: colors.sessions_bgtheme}}>
                    <FlatList
                        data={this.state.dataSource}
                        // data={[{title: 'Title Text', key: 'item1'}, {title: 'Title Text', key: 'item2'}, {title: 'Title Text', key: 'item3'}]}
                        keyExtractor={(item, index) => item.key}
                        renderItem={ ({item}) =>
                            <TouchableOpacity onPress={() => this.methodGoToTopics(item.id) }>
                                <View
                                    style={{marginVertical: dimensions.sizeRatio * 5, paddingVertical: dimensions.sizeRatio * 20, 
                                            marginHorizontal: dimensions.sizeRatio * 10,
                                            justifyContent: 'space-between', backgroundColor: 'white',
                                            borderRadius: dimensions.sizeRatio * 10,}}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                        <View style={{flex: 1.5, alignItems: 'center', justifyContent: 'center'}}>
                                            <Image source={{uri: item.image}} style={{width: dimensions.sizeRatio * 30, height: dimensions.sizeRatio * 30, resizeMode: 'contain'}} />
                                        </View>
                                        <View style={{flex: 7}}>
                                            <Text style={Platform.OS == 'ios' ? styles.course_text_ios : styles.course_text_android}>
                                                {item.name}
                                            </Text>                      
                                        </View>
                                        <View style={{flex: 1.5, alignItems: 'center', justifyContent: 'center'}}>
                                            <Image source={require('../images/right_caret.png')} style={styles.indicator_image} />
                                        </View>
                                    </View>
                                    
                                </View>
                            </TouchableOpacity>
                        }
                    />
                </View>
            )
        }
    }

  render() {

    return (
        <View style={{flex: 1, backgroundColor: colors.sessions_bgtheme, paddingTop: dimensions.sizeRatio * 12}}>

            {/* Status Bar */}
            {renderIf(Platform.OS != 'ios', 
                <StatusBar
                    barStyle="dark-content"
                    // backgroundColor={colors.theme}
                />
            )}

            {/* Activity View */}
            {renderIf(this.state.isLoading, 
                this.renderActivityIndicator()
            )}

            {/* List View */}
            {renderIf(this.state.isLoading == false, 
                this.renderFlatList()
            )}
                        
        </View>
    );
  }

}