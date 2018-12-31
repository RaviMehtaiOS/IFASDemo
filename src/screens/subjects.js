/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StatusBar, AsyncStorage, Text, View, Image, TouchableOpacity, FlatList, Alert, ActivityIndicator} from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import styles from '../styles/subject_style.js';
import CONSTANTS from '../resources/constants.js'
import renderIf from '../resources/utility.js';
import ProfileHeaderButton from '../headers/ProfileHeaderButton'
import BackSubjectsButton from '../headers/BackSubjectsButton'
import { EventRegister } from 'react-native-event-listeners';
import {showNativeAlert} from '../resources/app_utility.js'






export default class subjects extends Component {

//Navigation Method
    static navigationOptions = {
        title: 'Subjects',
        headerStyle: { backgroundColor: colors.theme },
        headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
       
        headerLeft: <BackSubjectsButton />,
        gesturesEnabled: false,
        headerRight: <ProfileHeaderButton />
    };

    constructor(props) {
        super(props);
        this.state = { 
            isLoading: true,
            access_token: '',
            dataSource: [],
            errorMessage: 'No subjects available'
        }
    }

    methodGoToTopics(subjectId, subjectName) {
        CONSTANTS.TOP_SCREEN = 'TOPICS'
        // this.props.navigation.navigate('Topics')
        this.props.navigation.navigate('Topics', { subjectId: subjectId.toString(), subjectName: subjectName })
    }

    getSubjects() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token); 

        console.log(formData)    

        fetch(CONSTANTS.BASE + CONSTANTS.POST_SUBJECTS, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          }).then((response) => response.json())
              .then((responseJson) => {


                if(responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                }else{
                    this.setState({
                        isLoading: false,
                        dataSource: responseJson.data.Subjects,
                    }, function(){
            
                    });
                }

                    
            })
              .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    dataSource: [],
                    isLoading: false,
                    errorMessage: 'Failed to fetch your subjects.'
                })
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
                    this.getSubjects()
               }else{
                showNativeAlert('Not logged-In')
               }
            } catch (error) {
                showNativeAlert(error.message)
                
            }
       }

    componentDidMount(){
        this.getAccessToken()

        //LISTENER FOR BACK BUTTON TAP
        this.listener = EventRegister.addEventListener('BackSubjectsEvent', (data) => {
            CONSTANTS.TOP_SCREEN = 'SESSIONS'
            this.props.navigation.goBack()
        })

        //LISTENER FOR PROFILE BUTTON TAP
        this.listener = EventRegister.addEventListener('ProfileEvent', (data) => {
            this.showProfile()
        })
    }

    

    componentWillUnmount() {
        console.log("Unmounted Subjects")
        EventRegister.removeEventListener(this.listener)
    }

    showProfile() {
        CONSTANTS.TOP_SCREEN = 'PROFILE'
        CONSTANTS.PREVIOUS_SCREEN_FOR_STREAMING = 'SUBJECTS'
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
        <View style={{flex: 1, paddingTop: dimensions.sizeRatio * 12, backgroundColor: colors.sessions_bgtheme}}>
            {renderIf(Platform.OS != 'ios', 
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor={colors.theme}
                />
            )}

            {renderIf(this.state.dataSource.length > 0,
                <FlatList
                data={this.state.dataSource}
                renderItem={ ({item}) =>
                    <TouchableOpacity  onPress={() => this.methodGoToTopics(item.subject_id, item.subject_name) } >
                        <View
                            style={{marginVertical: dimensions.sizeRatio * 5, paddingVertical: dimensions.sizeRatio * 15, 
                                    marginHorizontal: dimensions.sizeRatio * 10,
                                    justifyContent: 'space-between', backgroundColor: 'white',
                                    borderRadius: dimensions.sizeRatio * 10,}}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                
                                <View style={{flex: 8.75}}>
                                    <View style={{flex: 1, justifyContent: 'center',}}>
                                        <Text style={ Platform.OS == 'ios' ? styles.subjects_name_ios : styles.subjects_name_android}>
                                            {item.subject_name}
                                        </Text> 
                                    </View>                  
                                </View>

                                <View style={{flex: 1.25, alignItems: 'center', justifyContent: 'center'}}>
                                    <Image source={require('../images/right_caret.png')} style={styles.indicator_image} />
                                </View>
                            </View>
            
                            </View>
                    </TouchableOpacity>
                }
            />
            )}

            {renderIf(this.state.dataSource.length == 0,
                <View style = {{flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI}}>
                        {this.state.errorMessage}
                    </Text>
                </View>
            )}


            
        </View>
    );
  }
}



