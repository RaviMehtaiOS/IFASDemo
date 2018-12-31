/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, AsyncStorage, Text, Button, View, Image, TouchableOpacity, FlatList, Alert, ActivityIndicator} from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import styles from '../styles/subject_style.js';
import ProfileHeaderButton from '../headers/ProfileHeaderButton'
import BackTopicsButton from '../headers/BackTopicsButton'
import { EventRegister } from 'react-native-event-listeners';
import CONSTANTS from '../resources/constants';
import ExpandableList from 'react-native-expandable-section-list';
import MockData from '../MockData/mockdata'
import {showNativeAlert} from '../resources/app_utility.js'



export default class topics extends Component {

//Navigation Method
    static navigationOptions = {
        title: 'Topics',
        headerStyle: { backgroundColor: colors.theme },
        headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
        headerLeft: <BackTopicsButton />,
        headerRight: <ProfileHeaderButton />,
        gesturesEnabled: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            subjectName: '',
            subjectId: this.props.navigation.state.params.subjectId,
            subjectName: this.props.navigation.state.params.subjectName,
            dataSource: [],
            isError: false,
            errorMessage: 'No topics available for the selected subject.'
        };
        // Alert.alert(this.state.subjectId)
        
    }

    async getAccessToken() {
        try {
             const value = await AsyncStorage.getItem('ACCESS_TOKEN');
               if (value !== null) {
                    console.log('VALUE:' + value)
                    this.setState({
                        access_token: value.slice(1, -1),
                    })
                    this.getTopics()
               }else{
                showNativeAlert('Not logged-In')
               }
            } catch (error) {
                showNativeAlert(error.message)
            }
       }

    getTopics() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token); 
        formData.append('subject_id', this.state.subjectId);
        console.log(formData)    

        fetch(CONSTANTS.BASE + CONSTANTS.POST_TOPICS, {
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
                        isLoading: false,
                        dataSource: responseJson.data.Topics,
                        isError: false,
                        }, function(){
              
                    });
                }

                
              })
              .catch((error) => {
                console.error(error);
                this.setState({
                    dataSource: [],
                    isLoading: false,
                    isError: true,
                    errorMessage: 'Failed to load topics.'
                })
            });
    }

    showProfile() {
        CONSTANTS.TOP_SCREEN = 'PROFILE'
        CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING = 'TOPICS'
        this.props.navigation.navigate('Profile')
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



    componentDidMount(){
        //LISTENER FOR BACK BUTTON TAP
        this.listener = EventRegister.addEventListener('BackTopicsEvent', (data) => {
            CONSTANTS.TOP_SCREEN = 'SUBJECTS'
            this.props.navigation.goBack()            
        })

        //LISTENER FOR PROFILE BUTTON TAP
        this.listener = EventRegister.addEventListener('ProfileEvent', (data) => {
            this.showProfile()
            
        })


        this.getAccessToken()
      }

      componentWillUnmount() {
        console.log("Unmounted Topics")
      }

      methodGoToVideoPlayer(url='', topicId=0) {
            CONSTANTS.TOP_SCREEN = 'STREAMING'
            CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING = 'TOPICS'
            this.props.navigation.navigate('VideoPlayer', { youtubeUrl: url , topicId: topicId})

            // this.props.navigation.navigate('VideoStreaming', { youtubeUrl: url.substring(url.lastIndexOf('/')+1), topicId: topicId})
      }

      //START
      _renderRow = (rowItem, rowId, sectionId) => {
         return (
          <TouchableOpacity key={ rowId } onPress={() => { this.methodGoToVideoPlayer(rowItem.URL, rowItem.ID) }}>
            <View
            style={{paddingVertical: dimensions.sizeRatio * 20, 
                    marginHorizontal: dimensions.sizeRatio * 10,
                    justifyContent: 'space-between', backgroundColor: 'white',
                    }}
            >
            <View style={{ flexDirection: 'row' }}>
                <View style={{flex: 1, paddingLeft: dimensions.sizeRatio * 15}}>
                    <Image source={require('../images/video_icon.png')} style={{width: dimensions.sizeRatio * 20, height: dimensions.sizeRatio * 22}} />
                </View>
                <View style={{flex: 9,}}>
                    <Text style={{ fontFamily: CONSTANTS.DEMI ,fontSize: dimensions.sizeRatio * 15, color: colors.night, paddingHorizontal: dimensions.sizeRatio * 5 , fontFamily: CONSTANTS.DEMI,}}>
                        {rowItem.TITLE}
                    </Text>
                </View>
            </View>
            
          </View>
          </TouchableOpacity>
        )
      };
    
      _renderSection = (section, sectionId, state)  => {
        return (
          <View
            style={{marginVertical: dimensions.sizeRatio * 5, paddingVertical: 20, 
                    marginHorizontal: dimensions.sizeRatio * 10,
                    justifyContent: 'space-between', backgroundColor: 'white',
                    borderRadius: dimensions.sizeRatio * 10,}}
          >
            <View style={{ flexDirection: 'row' }}>
                <View style={{flex: 8.75}}>
                    <Text style={Platform.OS == 'ios'? styles.topic_name_ios : styles.topic_name_android}>
                        {section}
                    </Text>                      
                </View>
                <View style={{flex: 1.25, alignItems: 'center', justifyContent: 'center'}}>
                    <Image source={require('../images/right_caret.png')} style={styles.indicator_image} />
                </View>
            </View>
            
          </View>
        );
      };
    
      _btnPress = () => {
        console.log(this.ExpandableList);
        this.ExpandableList.setSectionState(0, false);
      };
      //END




    render() {
        if(this.state.isLoading){
            return(
              <View style={{flex: 1, padding: 20}}>
                <ActivityIndicator/>
              </View>
            )
        }

        if(this.state.dataSource.length == 0 && (this.state.isError == false || this.state.isError == true)) {
            return (
                <View style = {{flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI}}>
                        {this.state.errorMessage}
                    </Text>
                </View>
            )
        }
        else{
            return (

                <View style={{flex: 1, backgroundColor: colors.sessions_bgtheme}}>
                    <View style={{height: dimensions.sizeRatio * 30, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{color: colors.lightblack, fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 11}} >{this.state.subjectName}</Text>
                    </View>
    
                    <View style={{flex: 1}}>
                        <View style={{flex: 1}}>
                            <ExpandableList
                                ref={instance => this.ExpandableList = instance}
                                dataSource={this.state.dataSource}
                                headerKey="name"
                                memberKey="topic_videos"
                                renderRow={this._renderRow}
                                headerOnPress={(i, state) => console.log(i, state)}
                                renderSectionHeaderX={this._renderSection}
                                openOptions={[]}
                            />
                        </View>
                    </View>
                    
                </View>
                
                
            );
        }
    
        
      }
}



