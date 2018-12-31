/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, StatusBar, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator} from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';
import renderIf from '../resources/utility.js';
import {showNativeAlert} from '../resources/app_utility.js'


import { EventRegister } from 'react-native-event-listeners';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

class ActionBarImage extends Component {
 
    fireFilterEvent() {
        EventRegister.emit('FilterEvent', '')
    }


    render() {   
      return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => this.fireFilterEvent() }>
                <Image
                    source={require('../images/filter.png')}
                    style={{ width: dimensions.sizeRatio * 20, height: dimensions.sizeRatio * 20, marginRight: dimensions.sizeRatio * 15}}
                />
            </TouchableOpacity>
        </View>
      );
    }
  }

export default class free_videos extends Component {

    methodGoToLogin()
    {
        // Alert.alert('method GO Register')
        this.props.navigation.navigate('Login')
    }


    //Navigation Method
    static navigationOptions = {
        title: 'Free Videos',
        headerTitleStyle: {
            // fontWeight: '200',
            // color: '#2c38ff',
            textAlign: 'center',
            flex: 1,
          },
        headerLeft: <View />,
        gesturesEnabled: false,
        headerRight : <ActionBarImage />,
    };

    constructor(props) {
        super(props);
        this.state = {
            courseId: this.props.navigation.state.params.courseId,
            isLoading: true,
            isError: false,
            dataSource: [],
            hideLogin: this.props.navigation.state.params.hideLogin,
        }

    }

    methodStreamVideo(url,topicId) {
   
        CONSTANTS.NAV_COUNT = 2
         this.props.navigation.navigate('VideoPlayer', { youtubeUrl: url , topicId: topicId})
        // this.props.navigation.navigate('VideoStreaming', { youtubeUrl: url.substring(url.lastIndexOf('/')+1) })
        // this.props.navigation.navigate('VideoStreaming', { youtubeUrl: url.substring(url.lastIndexOf('/')+1), topicId: 0})

    }

    componentWillMount() {
        //LISTENER FOR FILTER BUTTON TAP
        this.listener = EventRegister.addEventListener('FilterEvent', (data) => {
            CONSTANTS.TOP_SCREEN = 'Courses'
            // if(this.state.hideLogin == true) {
                CONSTANTS.NAV_COUNT = CONSTANTS.NAV_COUNT - 1
            // }
            this.props.navigation.goBack()
        })

        //HIT API
        // Alert.alert(this.state.courseId)
        // Alert.alert(CONSTANTS.BASE + CONSTANTS.POST_FREE_VIDEOS)
        fetch(CONSTANTS.BASE + CONSTANTS.POST_FREE_VIDEOS, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                course_id: this.state.courseId,
            }),
          }).then((response) => response.json())
              .then((responseJson) => {
                  console.log(responseJson)
                this.setState({
                    isLoading: false,
                    dataSource: responseJson.data.TopicVideos,
                    isError: false,
                  }, function(){
          
                  });
              })
              .catch((error) => {
                this.setState({
                    dataSource: [],
                    isLoading: false,
                    isError: true,
                })
            });
    }
    
    componentWillUnmount() {
        EventRegister.removeEventListener(this.listener)
    }


    renderFlatList() {

        if(this.state.dataSource.length == 0 && this.state.isError == false) {
            return(
                <View style = {{flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: dimensions.sizeRatio * 14, fontFamily: CONSTANTS.DEMI,}}>
                        No Free videos available for the selected course.
                    </Text>
                </View>
            )
        }else if(this.state.dataSource.length == 0 && this.state.isError == true) {
            return(
                <View style = {{flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: dimensions.sizeRatio * 14, fontFamily: CONSTANTS.DEMI}}>
                        Failed to fetch free videos for the selected course.
                    </Text>
                </View>
            )
        }else{
            return (
                <View style={{flex: 1, backgroundColor: colors.white}}>
    
                {/* Status Bar */}
                {renderIf(Platform.OS != 'ios', 
                    <StatusBar
                        barStyle="dark-content"
                        backgroundColor={colors.theme}
                    />
                )}
    
                <FlatList
                    data={this.state.dataSource}
                    renderItem={({item}) =>
                        <TouchableOpacity onPress={() => this.methodStreamVideo(item.url,item.topic_id) } >
                            <View style={{height: dimensions.sizeRatio * 190}}>
                            <Image source={{uri: item.image}} style={{width: dimensions.width, height: dimensions.sizeRatio * 125, resizeMode: 'cover'}} />
                            <Text numberOfLines={1} style={{paddingTop: dimensions.sizeRatio * 10, 
                                                                color: colors.black, 
                                                                paddingLeft: dimensions.sizeRatio * 15, 
                                                                paddingRight: dimensions.sizeRatio * 15, 
                                                                fontSize: dimensions.sizeRatio * 14, 
                                                                height: dimensions.sizeRatio * 28,
                                                                fontFamily: CONSTANTS.DEMI}}>
                                {item.topic_name}
                            </Text>
                            <Text numberOfLines={1} style={{color: colors.lightblack, 
                                                                   paddingLeft: dimensions.sizeRatio * 15, 
                                                                   paddingRight: dimensions.sizeRatio * 15, 
                                                                   fontSize: dimensions.sizeRatio * 11, 
                                                                   height: dimensions.sizeRatio * 28}}>
                                {item.title}
                            </Text>
                            <Text numberOfLines={1} style={{color: colors.black, 
                                                                   backgroundColor: colors.freeVideosSeparator,
                                                                   paddingLeft: dimensions.sizeRatio * 15, 
                                                                   paddingRight: dimensions.sizeRatio * 15, 
                                                                   fontSize: dimensions.sizeRatio * 11, 
                                                                   height: dimensions.sizeRatio * 10}}>
                            </Text>
                            {/* <View style={{height: dimensions.sizeRatio * 10, backgroundColor: colors.freeVideosSeparator}}> {item.key} </View> */}
                        </View>
                        </TouchableOpacity>
                    }
                />
                </View>
            )
        }

        
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
                <Text style={{fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.white, fontFamily: CONSTANTS.DEMI,}}>
                    Welcome Back!
                </Text>
                <Text style={{fontSize: (dimensions.sizeRatio * 11), textAlignVertical: "center", color: colors.white, fontFamily: CONSTANTS.REGULAR}}>
                    There is a lot to learn
                </Text>
            </View>
            {/* Right Row */}
            <View style={{flex: 1, backgroundColor: 'transparent', justifyContent: "center", alignItems: "center"}}>
                <TouchableOpacity onPress={() => this.methodGoToLogin() } style={{height: dimensions.sizeRatio * 51, width: dimensions.sizeRatio * 145, backgroundColor: colors.white, borderRadius: dimensions.sizeRatio * 5}}>
                    <Text style={Platform.OS == 'ios' ? styles.signin_text_ios: styles.signin_text_android }>SIGN IN</Text>
                </TouchableOpacity>
            </View>
        </View>
        )
    }

  render() {
    return (
        <View style={{flex: 1}}>

            {/* Activity View */}
            {renderIf(this.state.isLoading, 
                this.renderActivityIndicator()
            )}

            {/* List View */}
            {renderIf(this.state.isLoading == false, 
                this.renderFlatList()
            )}
            
            {/* Bottom View */}
            {renderIf(this.state.hideLogin == false, 
                this.renderBottomView()
            )}
            
        </View>
    );
  }

 

}

   



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

  signin_text_ios: {
    color: colors.theme, 
    fontSize: dimensions.sizeRatio * 15, 
    justifyContent: "center", 
    alignItems: "center", 
    alignSelf: "center", 
    paddingTop: dimensions.sizeRatio * 20, 
    fontFamily: CONSTANTS.DEMI,
  },

  signin_text_android: {
    color: colors.theme, 
    fontSize: dimensions.sizeRatio * 15, 
    justifyContent: "center", 
    alignItems: "center", 
    alignSelf: "center", 
    paddingTop: dimensions.sizeRatio * 16, 
    fontFamily: CONSTANTS.DEMI,
  },

});
