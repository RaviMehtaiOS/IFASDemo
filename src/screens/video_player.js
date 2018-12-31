/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import { View, Platform, Alert, AsyncStorage, ActivityIndicator, Text } from 'react-native';
import colors from '../resources/colors';
import YouTube from 'react-native-youtube'
import BackPlayerButton from '../headers/BackPlayerButton'
import { EventRegister } from 'react-native-event-listeners';
import CONSTANTS from '../resources/constants';
import dimensions from '../resources/dimension';
import { showNativeAlert } from '../resources/app_utility';
import WebView from 'react-native-android-fullscreen-webview-video';

import Video from 'react-native-video';
import Orientation from 'react-native-orientation';

export default class video_player extends Component {

//Navigation Method
    static navigationOptions = {
        title: 'Video Player',
        // header: null,
        headerStyle: { backgroundColor: colors.theme },
        headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
        headerLeft: <BackPlayerButton />,
        gesturesEnabled: false,
        headerRight: <View />
    };

    constructor(props) {
        super(props);
        this.state = {
            isError: false,
            access_token: '',
            youtubeUrl: this.props.navigation.state.params.youtubeUrl,
            timer: 0,
            isLoading: true,
            topicId: this.props.navigation.state.params.topicId == null ? 0 : this.props.navigation.state.params.topicId,
            videoLength: 0,
            totalView: 0,
            errorMessage: 'Failed to load the video.',
            isHandlingBack: false,
            user_id: '',
        };
    }    

    componentDidMount(){
        CONSTANTS.TOP_SCREEN = 'STREAMING'

        //LISTENER FOR BACK BUTTON TAP
        this.listener = EventRegister.addEventListener('BackPlayerEvent', (data) => {
            CONSTANTS.NAV_COUNT = 1
                this.methodGoBack()
        })

        //LISTENER FOR CUSTOM HARDWARE BACK BUTTON TAP
        this.listener = EventRegister.addEventListener('HardWareBackCustom', (data) => {
            if(this.state.topicId != 0  && this.state.access_token != '') {
                this.updateVideoLog(false, false)
            }else{
                this.methodGoBack()
            }
        })

        if(this.state.topicId != 0 ) {

            // showNativeAlert(this.state.topicId.toString())

            // Count down timer
            this.interval = setInterval(
                () => this.timerUpdated(),
                1000
            );

            //Login status timer
            if(CONSTANTS.SESSION_TIMER != 0) {
                this.interval = setInterval(
                    () => this.checkLoginStatus(),
                    CONSTANTS.SESSION_TIMER * 60 * 1000
                );
            }

            this.getAccessToken()
        }else{
            this.setState({
                isLoading: false,
                isError: false,
            })
           
        }
        if(Platform.OS == 'android') {
            Orientation.unlockAllOrientations();
            Orientation.addOrientationListener(this._orientationDidChange);
        }
        
        
    }

    checkLoginStatus() {
        // showNativeAlert("Checking status")

        if(CONSTANTS.IS_LOGGED_IN == false) {
            return
        }

        const formData = new FormData();
        formData.append('access_token', this.state.access_token); 
        fetch(CONSTANTS.BASE + CONSTANTS.CHECK_ACCESS_TOKEN, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          }).then((response) => response.json())
              .then((responseJson) => {
                //   Alert.alert(responseJson.message)
                console.log(responseJson)

                if(responseJson.code != 1) {
                    this.removeItemValue('ACCESS_TOKEN')
                    this.updateVideoLog()
                }

                
              })
              .catch((error) => {
                console.error(error);
                showNativeAlert('Network request failed')
            });
    }



    async getAccessToken() {
        try {
             const value = await AsyncStorage.getItem('ACCESS_TOKEN');
               if (value !== null) {
                    console.log('VALUE:' + value)
                    this.setState({
                        access_token: value.slice(1, -1),
                    })
                    this.getVideoLog()
               }else{
                this.getVideoLog()
                // showNativeAlert('Not logged-In')
               }
            } catch (error) {
                showNativeAlert(error.message)
                
            }
       }

    logoutUser() {
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        CONSTANTS.TOP_SCREEN = ''
        this.props.navigation.popToTop()
        CONSTANTS.IS_LOGGED_IN = false
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

    getVideoLog() {
        const formData = new FormData();
        formData.append('topic_video_id', this.state.topicId);
        
         let strURl = CONSTANTS.BASE + CONSTANTS.GET_VIDEO_LOG
        if (this.state.access_token == '') {
            strURl = CONSTANTS.BASE + CONSTANTS.GET_VIDEO_LOG_FREE
        }else {
            formData.append('access_token', this.state.access_token); 
        }
        console.log(formData)  
        console.log(strURl)   
        fetch(strURl, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          }).then((response) => response.json())
              .then((responseJson) => {
                //   Alert.alert(responseJson.message)
                console.log(responseJson)

                if(responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                }else if(responseJson.code == 1){
                    this.setState({
                        isLoading: true,
                        videoLength: responseJson.data.video_length * responseJson.data.multiplier,
                        user_id: responseJson.data.USER_ID,
                        youtubeUrl: (CONSTANTS.VIDEO_TYPE == 1) ? ((responseJson.data.tmp_url != '') ? responseJson.data.tmp_url : this.state.youtubeUrl) : this.state.youtubeUrl,
                        }, function(){
                            // showNativeAlert(this.state.youtubeUrl)
                            if(this.state.videoLength * 60 > responseJson.data.TOTAL_VIEW) {
                                // showNativeAlert('Can view video')
                                this.setState({
                                    isLoading: false,
                                    isError: false,
                                })
                            }else{
                                // showNativeAlert('Cannot view video')
                                clearInterval(this.interval);
                                this.setState({
                                    errorMessage: 'You have reached your time limit for this video.',
                                    isLoading: false,
                                    isError: true,
                                    timer: 0,
                                })
                            }
                    });
                }

                
              })
              .catch((error) => {
                console.error(error);
                clearInterval(this.interval);
                this.setState({
                    isLoading: false,
                    isError: true,
                    timer: 0,
                })
            });
    }

    updateVideoLog() {
        // const divisor = (this.state.timer / 60) | 0

        const divisor = this.state.timer


            const formData = new FormData();
            formData.append('access_token', this.state.access_token); 
            formData.append('topic_video_id', this.state.topicId);
            formData.append('duration', divisor);
            formData.append('user_id', this.state.user_id);
            console.log(formData)    

            fetch(CONSTANTS.BASE + CONSTANTS.SET_VIDEO_LOG, {
                method: 'POST',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
                },
                body: formData,
            }).then((response) => response.json())
                .then((responseJson) => {
                    console.log(responseJson)
                })
                .catch((error) => {
                    console.error(error);
                });
    }

    timerUpdated() {
        this.setState({timer: ++this.state.timer})
        // showNativeAlert("Timer updating")
    }


    componentWillUnmount() {

        if(Platform.OS == 'android') {
            Orientation.removeOrientationListener(this._orientationDidChange);
            Orientation.lockToPortrait();
        }

        console.log("Unmounted")
        clearInterval(this.interval);

        if(CONSTANTS.SESSION_TIMER == 0) {
            return
        }



        
        
        if(this.state.topicId != 0 && this.state.access_token != '') {
            this.updateVideoLog()
        }
        this.setState({timer: ++this.state.timer})

    }

    _orientationDidChange = (orientation) => {
        if (orientation === 'LANDSCAPE') {
            console.log('LANDSCAPE')
            // Orientation.lockToLandscape()
        } else {
            console.log('PORTRAIT')
            // Orientation.lockToLa
        }
        
     }

    methodGoBack() {
        if(this.state.topicId != 0) {
            if(CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING == 'TOPICS') {
                CONSTANTS.TOP_SCREEN = 'TOPICS'
            }else if(CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING == 'SESSIONS'){
                CONSTANTS.TOP_SCREEN = 'SESSIONS'
            }
            CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING = ''
        }
        
        this.props.navigation.goBack()
    }

    render() {
        if(this.state.isLoading) {
            return(
                <View style={{flex: 1, padding: 20}}>
                    <ActivityIndicator/>
                </View>
            )
        }else{

            if(this.state.isError) {
                return (
                    <View style = {{flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI}}>
                            {this.state.errorMessage}
                        </Text>
                    </View>
                )
            }else{
                if(Platform.OS == 'android') {
                    console.log("Unlocking")
                    Orientation.unlockAllOrientations();
                    return(
                        <View style={{flex: 1, backgroundColor: 'black'}}>
                            <WebView
                                source={{uri: this.state.youtubeUrl}}
                                style={{flex: 1}} 
                            />
                        </View>
                        
                    )
                }else{
                    return(
                        <View style={{backgroundColor: 'black', width: dimensions.width, flex: 1}}>
                            <Video source={{uri: this.state.youtubeUrl}}   // Can be a URL or a local file.
                                controls = {true}
                                fullscreen = {false}
                                resizeMode = "contain"
                                ref={(ref) => {
                                    this.player = ref
                                }}                                      // Store reference
                                // onBuffer={this.onBuffer}                // Callback when remote video is buffering
                                // onEnd={this.onEnd}                      // Callback when playback finishes
                                // onError={this.videoError}               // Callback when video cannot be loaded
                                // style={styles.backgroundVideo} 
                                style={{flex: 1, backgroundColor: 'transparent'}}
                            /> 
    
                            {/* <VideoPlayer style={{flex: 1}} url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" /> */}
    
                        </View>
                    )
                }
                
            }
        }
    }
        
        
      
}



