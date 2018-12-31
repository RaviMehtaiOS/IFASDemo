/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, ActivityIndicator, BackHandler, Text, View, Image, StatusBar,TouchableOpacity, Alert, AsyncStorage} from 'react-native';
import colors from '../resources/colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import renderIf from '../resources/utility.js';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';
import styles from '../styles/sessions_style.js';
import ProfileHeaderButton from '../headers/ProfileHeaderButton'
import BlinkView from 'react-native-blink-view'
import { EventRegister } from 'react-native-event-listeners';
import {showNativeAlert} from '../resources/app_utility.js'
// import Orientation from 'react-native-orientation';



const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class sessions extends Component {

//Navigation Method
    static navigationOptions = {
        title: 'Sessions',
        headerStyle: { 
            backgroundColor: colors.theme,
            elevation: 0, 
            shadowColor: 'transparent',
            borderBottomWidth: 0,
            shadowOpacity: 0
        },
        headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
        
        headerLeft: <View />,
        gesturesEnabled: false,
        headerRight: <ProfileHeaderButton />,
        
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '', 
            dateTime: '',
            liveUrl: '',
        };

        this.backButtonListener = null;
        
    }



    methodGoToRecordings() {
        CONSTANTS.TOP_SCREEN = 'SUBJECTS'
        this.props.navigation.navigate('Subjects')
        // Alert.alert(CONSTANTS.TOP_SCREEN)
    }

    methodGoLive() {
        // Alert.alert('method GO Live')
        let url = this.youtube_parser(this.state.liveUrl)
        if(url != 'NULL') {
            CONSTANTS.TOP_SCREEN = 'STREAMING'
            CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING = 'SESSIONS'
                 this.props.navigation.navigate('VideoStreaming', { youtubeUrl: url})
        }

        // this.props.navigation.navigate('Sessions')
    }
     youtube_parser(url){
        var regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
         var match = url.match(regExp);
         if(match != null) {
             return match[1]
         } else { 
             console.log("The youtube url is not valid.");
             return 'NULL';
         }
 
 
  }

   async getAccessToken(shouldMoveToLiveSession=false) {
        try {
             const value = await AsyncStorage.getItem('ACCESS_TOKEN');
               if (value !== null) {
                    console.log('VALUE:' + value)
                    this.setState({
                        access_token: value.slice(1, -1),
                    })
                    this.getLiveSessionData(shouldMoveToLiveSession)
                    this.getProfile()
               }else{
                showNativeAlert('Not logged-In')
               }
            } catch (error) {
                showNativeAlert(error.message)
                
            }
       }

    getLiveSessionData(shouldMoveToLiveSession=false) {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token); 
        // formData.append('subject_id', this.state.subjectId);
        console.log(formData)    

        fetch(CONSTANTS.BASE + CONSTANTS.POST_LIVE_SESSIONS, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          }).then((response) => response.json())
              .then((responseJson) => {
                    console.log(responseJson)

                    this.setState({
                        isLoading: false,
                    }, function(){
          
                    });

                    if(responseJson.code == 201) {
                        this.removeItemValue('ACCESS_TOKEN')
                    }else{
                        //Setting Live session data
                        if(responseJson.data.LiveSession[0] == null) {

                        }else{
                            const link = responseJson.data.LiveSession[0]

                            var dateArray = ""
                            var strDate = ""
                            if(link.start_time.trim() != "") {
                                dateArray = link.start_time.split(' ')
                                strDate = dateArray[0] + " " + dateArray[1].split('+')[0]
                            }
                            

                            this.setState({
                                isLoading: false,
                                liveUrl: link.url,
                                dateTime: strDate,
                            }, function(){

                            });

                            CONSTANTS.VIDEO_TYPE = responseJson.data.is_video_link_created
                            // showNativeAlert(CONSTANTS.VIDEO_TYPE.toString())
                            if(responseJson.data.timer_required == 1) {
                                if(responseJson.data.timer != null) {
                                    if(responseJson.data.timer != '') {
                                        if(isNaN(responseJson.data.timer)) {
                                            // showNativeAlert('Is a not number')
                                            CONSTANTS.SESSION_TIMER = 0
                                        }else{
                                            // showNativeAlert('Is a number')
                                            CONSTANTS.SESSION_TIMER = responseJson.data.timer
                                        }
                                        
                                    }else{
                                        CONSTANTS.SESSION_TIMER = 0
                                        // showNativeAlert('Empty')
                                    }
                                }else{
                                    CONSTANTS.SESSION_TIMER = 0
                                    // showNativeAlert('Null')
                                }
                            }else{
                                CONSTANTS.SESSION_TIMER = 0
                            }
                            
                            

                            if(shouldMoveToLiveSession) {
                                this.methodGoLive()
                            }
                        }
                    }

                    
                    
                    // Alert.alert(this.state.dateTime + ' ' + this.state.liveUrl)
                    
              })
              .catch((error) => {
                console.error(error);
                showNativeAlert("Network request failed" )
            });
    }

    logoutUser() {
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        CONSTANTS.TOP_SCREEN = ''
        this.props.navigation.popToTop()
        CONSTANTS.IS_LOGGED_IN = false
    }

    showProfile() {
        CONSTANTS.TOP_SCREEN = 'PROFILE'
        CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING = 'SESSIONS'
        this.props.navigation.navigate('Profile')
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
    

    componentDidMount() {

        // if(Platform.OS == 'android') {
        //     Orientation.addOrientationListener(this._orientationDidChange);
        // }



        this.getAccessToken(false)

        //Back Button Handling

        if(Platform.OS == 'android') {
            CONSTANTS.TOP_SCREEN = 'SESSIONS'
            this.backButtonListener = BackHandler.addEventListener('hardwareBackPress', function() { 
            console.log("hardware Back Press")   
            if (CONSTANTS.TOP_SCREEN == 'SESSIONS') {
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
            }else if(CONSTANTS.TOP_SCREEN == 'SUBJECTS') {
                CONSTANTS.TOP_SCREEN = 'SESSIONS'
                return false
            }else if(CONSTANTS.TOP_SCREEN == 'TOPICS') {
                CONSTANTS.TOP_SCREEN = 'SUBJECTS'
                return false
            }else if(CONSTANTS.TOP_SCREEN == 'PROFILE') {
                CONSTANTS.TOP_SCREEN = CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING
                CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING = ''
            }
            else if(CONSTANTS.TOP_SCREEN == 'STREAMING') {
                // EventRegister.emit('HardWareBackCustom', '')
                
                if(CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING == 'SESSIONS') {
                    CONSTANTS.TOP_SCREEN = 'SESSIONS'
                }else if(CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING == 'TOPICS') {
                    CONSTANTS.TOP_SCREEN = 'TOPICS'
                }
                CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING = ''
            }
            return false;
            });
        }

        



        //LISTENER FOR PROFILE BUTTON TAP
        this.listener = EventRegister.addEventListener('ProfileEvent', (data) => {
            this.showProfile()
        })

        //Notification received
        this.listener = EventRegister.addEventListener('Notification_Received', (data) => {
            // showNativeAlert("Notification received")
            if(CONSTANTS.TOP_SCREEN != 'SESSIONS') {
                // showNativeAlert("In")
                // this.props.navigation.goBack('Sessions')
                CONSTANTS.TOP_SCREEN = 'SESSIONS'
                CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING = ''
                this.props.navigation.navigate('Sessions')
                this.getAccessToken(true)
            }else{
                this.getAccessToken(true)
            }
        })

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
              });
    }
     async storeItem(Accesskey, Accessitem, statusKey, statusItem) {
        try {
            //we want to wait for the Promise returned by AsyncStorage.setItem()
            //to be resolved to the actual value before returning the value
            var jsonOfAccess = await AsyncStorage.setItem(Accesskey, JSON.stringify(Accessitem));
            var jsonOfStatus = await AsyncStorage.setItem(statusKey, JSON.stringify(statusItem));

            CONSTANTS.IS_LOGGED_IN = true

            if(statusItem == 0) {
                 this.props.navigation.navigate('CoursesUnpaid')
            }
            
         } catch (error) {
          console.log(error.message);
        }
      }
    componentWillUnmount() {
        console.log("Unmounted Sessions")
        if(Platform.OS == 'android') {
            this.backButtonListener.remove();
        }
        // BackHandler.removeEventListener('hardwareBackPress', function() {
        //     // Alert.alert("Removing Session")
        //     return true
        // })

        EventRegister.removeEventListener(this.listener)

        // if(Platform.OS == 'android') {
        //     // Remember to remove listener
        //     Orientation.removeOrientationListener(this._orientationDidChange);
        // }
        
    }

    // _orientationDidChange = (orientation) => {
    //     if (orientation === 'LANDSCAPE') {
    //       // do something with landscape layout
    //       console.log('LANDSCAPE')
    //     } else {
    //       // do something with portrait layout
    //       console.log('PORTRAIT')
    //     }
    // }

    


  render() {

    if(this.state.isLoading){
        return(


          <View style={{flex: 1, padding: 20}}>
            {renderIf(Platform.OS != 'ios', 
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor={colors.theme}
                />
            )}
            
            <ActivityIndicator/>
          </View>
        )
    }

    return (
        <View style={{flex: 1, backgroundColor: colors.sessions_bgtheme}}>
            {renderIf(Platform.OS != 'ios', 
                <StatusBar
                    barStyle="light-content"
                    backgroundColor={colors.theme}
                />
            )}

             <KeyboardAwareScrollView enableResetScrollToCoords={true} contentContainerStyle={styles.scroll} enableOnAndroid={true}>
             <View style={styles.dummy_navbar} />
            
            <View style={styles.main_separator_view}>
            
                <View style={styles.live_session}>
                    <TouchableOpacity onPress={() => this.methodGoLive() } style={{flex: 1, alignItems:'center',} }>

                        <Image source={require('../images/live_session.png')} style={styles.live_icon} />
                        <Text style={styles.live_text}>
                            Live Sessions
                        </Text>
                        <Text style={styles.live_sub_text} numberOfLines={2}>
                            Live session information for the course {'\n'} will be displayed here.
                        </Text>

                        {/* NO LIVE URL AND NO DATE TIME */}
                        {renderIf(this.state.liveUrl == '' && this.state.dateTime == '', 
                            <View style={{top: dimensions.sizeRatio * 5, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                <Text  style={{fontSize: dimensions.sizeRatio * 15, color: colors.theme, fontFamily: CONSTANTS.DEMI}}>
                                    No live session available.
                                </Text>
                            </View>
                        )}

                        {/* LIVE URL AND DATE TIME */}
                        {renderIf(this.state.liveUrl != '' && this.state.dateTime != '', 
                            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', height: 20 * dimensions.sizeRatio, top: 12 * dimensions.sizeRatio, }}>
                                <BlinkView blinking={true} delay={600}>
                                    <Text style={{fontWeight: 'bold', fontSize: dimensions.sizeRatio * 15, color: colors.theme, fontFamily: CONSTANTS.DEMI,}}>CLICK TO VIEW LIVE SESSION</Text>
                                </BlinkView>
                            </View>
                        )}
                        
                        {/* NO LIVE URL BUT DATE TIME */}                        
                        {renderIf(this.state.liveUrl == '' && this.state.dateTime != '', 
                        <View style={{height: 25 * dimensions.sizeRatio, top: 25 * dimensions.sizeRatio, }}>
                            <View style={{height: 12.5 * dimensions.sizeRatio, justifyContent: 'center',  alignItems: 'center',}} >
                                <Text  style={{fontWeight: 'bold', fontSize: dimensions.sizeRatio * 15, color: colors.theme, fontFamily: CONSTANTS.DEMI,}}>
                                    Live session available on: 
                                </Text>
                            </View>
                            <View style={{height: 12.5 * dimensions.sizeRatio, justifyContent: 'center',  alignItems: 'center', top:  8 * dimensions.sizeRatio}} >
                                <Text  style={{fontWeight: 'bold', fontSize: dimensions.sizeRatio * 15, color: colors.theme, fontFamily: CONSTANTS.DEMI,}}>
                                    {this.state.dateTime}
                                </Text>
                            </View>
                        </View>
                        )}

                    </TouchableOpacity>

                </View>

                <View style={styles.separator_session}></View>

                <View style={styles.recorded_session}>
                    <TouchableOpacity onPress={() => this.methodGoToRecordings() } style={{flex: 1, alignItems:'center',} }>
                        <Image source={require('../images/recorded_session.png')} style={styles.recorded_icon} />
                        <Text style={styles.recorded_text}>
                            Recorded Sessions
                        </Text>
                        <Text style={styles.recorded_sub_text} numberOfLines={2}>
                            Recorded session of your course {'\n'} can be viewed in this section
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
             </KeyboardAwareScrollView>
            
        </View>
    );
  }
}



