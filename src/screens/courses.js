/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StatusBar, Text, View, Linking, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, AsyncStorage} from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';
import styles from '../styles/courses_style.js';
import renderIf from '../resources/utility.js';
import {showNativeAlert} from '../resources/app_utility.js'
import PaymentHeaderCourseButton from '../headers/PaymentHeaderCourseButton';
import { EventRegister } from 'react-native-event-listeners';



const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});




export default class courses extends Component {

    //Navigation Method
    static navigationOptions = {
        title: 'Select Course',
        headerTitleStyle: {
            // fontWeight: '200',
            // color: '#2c38ff',
            textAlign: 'center',
            flex: 1,
          },
        headerLeft: <View />,
        headerRight: <PaymentHeaderCourseButton />, 
    };

    constructor(props) {
        super(props);
        this.state = { 
            isLoading: true,
            isLoggedIn: false,
            dataSource: [],
            errorMessage: 'Failed to fetch courses list.',
        }
    }

    methodGoToTopics(itemId) {
        // Alert.alert(itemId.toString())
        this.props.navigation.navigate('FreeVideos', { courseId: itemId.toString(), hideLogin: false })
    }

    methodGoToLogin() {
        this.props.navigation.navigate('Login')
    }

    methodGoToSessions() {
        this.props.navigation.navigate('Sessions')
    }

    methodGoToCourseUnpaid() {
        this.props.navigation.navigate('CoursesUnpaid')
    }



    async loginStatus() {
        try {
            const value = await AsyncStorage.getItem('ACCESS_TOKEN');
            if (value !== null) {
                // We have data!!
                // 
                this.getCourses()
                CONSTANTS.IS_LOGGED_IN = true
                const status = await AsyncStorage.getItem('COURSE_PAYMENT_STATUS');
                if(status == 0) { //Unpaid
                    this.methodGoToCourseUnpaid()
                    // showNativeAlert(this.props.navigation.state.routeName)
                }else{
                    this.methodGoToSessions()
                }


            }else{
                this.getCourses()
            }
        } catch (error) {
            // Error retrieving data
            this.getCourses()
        }
    }

    componentDidMount(){
        this.loginStatus()
     

        //LISTENER FOR PAYMENT BUTTON TAP
        this.listener = EventRegister.addEventListener('PaymentCourseEvent', (data) => {
            Linking.openURL('http://ifasonline.com/register.jsp')
        })
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

                  CONSTANTS.ADMIN_EMAIL =  responseJson.data.admin_email
                  CONSTANTS.ADMIN_PHONE =  responseJson.data.admin_phone
                
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
                    backgroundColor={colors.theme}
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

            {/* Bottom View */}
            {renderIf(this.state.isLoading == false || this.state.isLoading == true, 
                this.renderBottomView()
            )}
                        
        </View>
    );
  }

}