const constants = {
    //CONSTANT VALUES/MESSAGES
    APP_NAME: 'IFAS',
    iOS: 'ios',
    ANDROID: 'android',
APP_HAS_LAUNCHED: false,
    //API
    // LOCAL = 'http://192.168.1.45/ifsa_api/apis/',
    // DYNAMIC = 'http://dynamicwebsite.co.in/pa/ifas/apis/',
    // LIVE = 'http://dynamicwebsite.co.in/pa/ifas/apis/',
    
    // BASE: 'http://192.168.1.45/ifsa_api/apis/',
    BASE: 'http://dynamicwebsite.co.in/pa/ifas/apis/',
    GET_COURSES: 'getCourses.json',
    POST_FREE_VIDEOS: 'getFreeVideos.json',
    POST_LOGIN: 'login.json',
    POST_SUBJECTS : 'getSubjectList.json',
    POST_TOPICS : 'getTopics.json',
    POST_LIVE_SESSIONS : 'getLiveSessions.json',
    PROFILE : 'getUserProfile.json',
    GET_VIDEO_LOG: 'getVideoLog.json',
    GET_VIDEO_LOG_FREE:'getVideoLogFree.json',
    SET_VIDEO_LOG: 'setVideoLog.json',
    LOGOUT: 'logout.json',
    CHECK_ACCESS_TOKEN: 'checkAccessToken.json',

    //FONT
    DEMI: 'AvenirNextLTPro-Demi',
    REGULAR: 'AvenirNextLTPro-Regular',

    //TOP VIEW CONTROLLER
    TOP_SCREEN: '',
    PREVIOUS_SCREEN_FOR_STREAMING: '',

    
    SESSION_TIMER: 0,
    VIDEO_TYPE: 1,

    //MESSAGES
    LOGOUT_MESSAGE: 'Your session has been expired. Please login again to continue.',
    SWW_MESSAGE: 'Something went wrong. Please try again later.',

    //DEVICE TOKEN
    DEVICE_TOKEN: '',
    IS_LOGGED_IN: false,
    VIDEO_URL: '',


    //ADMIN DETAILS
    ADMIN_EMAIL: '',
    ADMIN_PHONE: '',
  };
 export default constants;