/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import { View, Platform, Alert, StatusBar, AsyncStorage, ActivityIndicator, Text, BackHandler } from 'react-native';
import colors from '../resources/colors';
import YouTube from 'react-native-youtube'
import BackStreamingButton from '../headers/BackStreamingButton'
import FullScreenButton from '../headers/FullScreenHeaderButton'
import { EventRegister } from 'react-native-event-listeners';
import CONSTANTS from '../resources/constants';
import dimensions from '../resources/dimension';
import { showNativeAlert } from '../resources/app_utility';
import renderIf from '../resources/utility.js';
import Orientation from 'react-native-orientation';

const youtubeHTML = require('../MockData/youtube.html');

var isFullScreen = false;

export default class video_streaming extends Component {

//Navigation Method
    static navigationOptions = {
        title: 'Live Streaming',

        header: null,

        // headerStyle: { backgroundColor: colors.theme },
        // headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
        // headerLeft: <BackStreamingButton />,
        // gesturesEnabled: false,
        // headerRight: <View />
    };

    constructor(props) {
        super(props);
        this.state = {
            fullscreen:false,
            isError: false,
            access_token: '',
            youtubeUrl: this.props.navigation.state.params.youtubeUrl.trim(),
            timer: 0,
            isLoading: true,
            topicId: this.props.navigation.state.params.topicId == null ? 0 : this.props.navigation.state.params.topicId,
            videoLength: 0,
            totalView: 0,
            errorMessage: 'Failed to load the video.',
            isHandlingBack: false,
            play: true,
            
        };


        // showNativeAlert(this.state.time_duration.toString())
    }   
    
    

    componentDidMount(){
        CONSTANTS.TOP_SCREEN = 'STREAMING'
 

        //LISTENER FOR BACK BUTTON TAP
        this.listener = EventRegister.addEventListener('FullScreenEvent', (data) => {
            this.methodGoLive()
        })

        //LISTENER FOR BACK BUTTON TAP
        this.listener = EventRegister.addEventListener('BackStreamingEvent', (data) => {
            CONSTANTS.NAV_COUNT = 1
            if(this.state.isHandlingBack == false) {
                if(this.state.topicId != 0) {
                    this.updateVideoLog(true)
                }else{
                    this.methodGoBack()
                }
            }
            
        })

        //LISTENER FOR CUSTOM HARDWARE BACK BUTTON TAP
        this.listener = EventRegister.addEventListener('HardWareBackCustom', (data) => {
            this.updateVideoLog(false)
        })

        // showNativeAlert(this.state.topicId.toString())


        if(this.state.topicId != 0) {

            // showNativeAlert(this.state.topicId.toString())

            // Count down timer
            this.interval = setInterval(
                () => this.timerUpdated(),
                1000
            );
            this.getAccessToken()
        }else{
            this.setState({
                isLoading: false,
                isError: false,
            })
        }


        if(CONSTANTS.SESSION_TIMER != 0) {
            // showNativeAlert('Yes')
            this.interval = setInterval(
                () => this.getAccessToken(),
                CONSTANTS.SESSION_TIMER * 60 * 1000
            );
        }
        


        // if(Platform.OS == 'android') {
            Orientation.unlockAllOrientations();
            Orientation.addOrientationListener(this._orientationDidChange);
        // }
        
    }

    checkLoginStatus() {
        // showNativeAlert("Checking status")
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
                }

                
              })
              .catch((error) => {
                console.error(error);
                showNativeAlert('Network request failed')
            });
    }

    updateTimer() {
        // showNativeAlert('Updating timer')
        this.updateVideoLog()
    }

    async getAccessToken() {
        
        try {
             const value = await AsyncStorage.getItem('ACCESS_TOKEN');
               if (value !== null) {
                    console.log('VALUE:' + value)
                    this.setState({
                        access_token: value.slice(1, -1),
                    })
                    this.checkLoginStatus()
               }else{
                showNativeAlert('Not logged-In')
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
        formData.append('access_token', this.state.access_token); 
        formData.append('topic_video_id', this.state.topicId);
        console.log(formData)    

        fetch(CONSTANTS.BASE + CONSTANTS.GET_VIDEO_LOG, {
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
                        videoLength: responseJson.data.video_length * responseJson.data.multiplier
                        }, function(){
                            // showNativeAlert(this.state.videoLength.toString())
                            if(this.state.videoLength > responseJson.data.total_view) {
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

    updateVideoLog(isBackButton=true) {
        const divisor = (this.state.timer / 60) | 0

        this.setState({
            isHandlingBack: true,
            timer: 0
        })

        

        // showNativeAlert('DIVISOR: ' + divisor.toString())
        if(divisor == 0) {
            if(isBackButton) {
                this.methodGoBack()
            }
            
        }else{
            const formData = new FormData();
            formData.append('access_token', this.state.access_token); 
            formData.append('topic_video_id', this.state.topicId);
            formData.append('duration', divisor);
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
                    
                    this.setState({
                        isHandlingBack: false,
                    })

                    console.log(responseJson)

                    // if(responseJson.code == 201) {
                    //     this.removeItemValue('ACCESS_TOKEN')
                    // }else if(responseJson.code == 1){
                        // showNativeAlert('Done')
                    // }
                    if(isBackButton) {
                        this.methodGoBack()
                    }
                    
                })
                .catch((error) => {
                    console.error(error);
                    this.setState({
                        isHandlingBack: false,
                    })
                    if(isBackButton) {
                        this.methodGoBack()
                    }
                });
        }
        
        
    }

    timerUpdated() {
        this.setState({timer: ++this.state.timer})
        // showNativeAlert(this.state.timer.toString())
    }

    componentWillUnmount() {
        console.log("Remove Streaming")
        clearInterval(this.interval);
    
        // if(Platform.OS == 'android') {
            // Remember to remove listener
            Orientation.removeOrientationListener(this._orientationDidChange);
            Orientation.lockToPortrait();
        // }
    }

    _orientationDidChange = (orientation) => {
        if (orientation === 'LANDSCAPE') {
            // do something with landscape layout
            console.log('LANDSCAPE')
            // this.setState({fullscreen:true})

        } else {
            // do something with portrait layout
            console.log('PORTRAIT')
            
            
        }
        
     }

    methodGoBack() {
        if(CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING == 'TOPICS') {
            CONSTANTS.TOP_SCREEN = 'TOPICS'
        }else if(CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING == 'SESSIONS'){
            CONSTANTS.TOP_SCREEN = 'SESSIONS'
        }
        CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING = ''
        Orientation.lockToPortrait();
        this.props.navigation.goBack()
    }

    methodGoLive() {
        showNativeAlert('Clicked')
        // this.togglePlayClick(this.state.play)
        

        // if(Platform.OS == 'ios') {
        //     Orientation.getOrientation((err, orientation) => {
        //         if(orientation === 'LANDSCAPE') {
        //             Orientation.lockToPortrait()
        //         }else{
        //             Orientation.lockToLandscape()
        //         }    
        //     });
        // }else{
            if (this.state.fullscreen == false) {
                    isFullScreen = true
                    this.setState({fullscreen:true})
                   /* setTimeout(function () {
                        console.log('set full screen')
                        if(isFullScreen) {
                            console.log('In full screen')
                            this.setState({fullscreen:true})
                        }else{
                            console.log('not in full screen')
                        }
                        
                    }.bind(this), 100);
*/
              
            }else {
                this.setState({fullscreen:false})
                console.log('set iniline screen')
            }
            // this.render()
        // }
      }


      togglePlay = (e) => {
        console.log(e)
      
        // this.forceUpdate()
          
        let self = this;
    
        setTimeout(function() {
            
            console.log(e)
            self.setState ({ play: true });
         
        }, 100);
      };

      togglePlayClick = (e) => {
          
        let self = this;
    
        setTimeout(function() {
            console.log(!e)
          self.setState(s => ({ play: !e }));
        //   this.forceUpdate()
        }, 200);
      };


      methodFullScreen(e) {
        console.log("Method full screen")        
      }
     

    render() {

        


        {renderIf(Platform.OS == 'ios', 
            <StatusBar
                barStyle="dark-content"
                // backgroundColor={colors.theme}
            />
        )}


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
                    return(   
                    
                        <View 
                        style={{flex: 1, backgroundColor: 'tranparent', 
                        justifyContent: 'center',} }
                        // onStartShouldSetResponder={() => this.methodGoLive()}
                         >
                            <YouTube
                                apiKey = "AIzaSyCZs5LGQYP8EL8uQvvpO6SA-cFZs8kHw30"
                                videoId = {this.state.youtubeUrl} // The YouTube video ID
                                play={this.state.play}     		
                                fullscreen={false}
                                // control playback of video with true/false
                                      // control whether the video should play in fullscreen or inline
                                loop={this.state.play}             // control whether the video should loop when ended
                                showinfo={false}
                                controls={0}
                                // modestbranding={false}
                                 
                                onError={e => console.log(e)}
                                onChangeFullscreen={e => this.methodFullScreen(e) }
                                // onChangeFullscreen={e => console.log(e)}
                                onReady={e => this.setState({ isReady: true })}
                                

                                style={{ height: dimensions.width - 30, backgroundColor: 'black', justifyContent: 'center', }}
                                // onReady={e => this.setState({ isReady: true })}
                                onChangeState={e => console.log(e.state)}
                                onChangeQuality={e => this.setState({ quality: e.quality })}
                                // onError={e => this.setState({ error: Alert.alert("Error") })}
                             />

                        </View>
                    )
                } else{
                    return(   
                    
                        <View style={{flex: 1, backgroundColor: 'transparent', justifyContent: 'center',}}>
                            <Text style={{ top:0,height:80, zIndex: 20,backgroundColor: 'transparent'}}> </Text>
                            <YouTube
                                apiKey = "AIzaSyCZs5LGQYP8EL8uQvvpO6SA-cFZs8kHw30"
                                videoId = {this.state.youtubeUrl} // The YouTube video ID
                                play={true}             // control playback of video with true/false
                                fullscreen={this.state.fullscreen}       // control whether the video should play in fullscreen or inline
                                loop={true}             // control whether the video should loop when ended
                                showinfo={false}
                                controls={1}
                                // modestbranding={false}
                                onReady={e => this.setState({ isReady: true })}
                                onChangeState={e => this.setState({ status: e.state })}
                                onChangeQuality={e => this.setState({ quality: e.quality })}
                                // onError={e => this.setState({ error:  console.log(error) })}
                                style={{ alignSelf: 'stretch', height: dimensions.sizeRatio * 400, top:-80 }}
                            />
                        </View>
                    )
                }
                
                
            }


            
        }
    }
        
        
      
}



