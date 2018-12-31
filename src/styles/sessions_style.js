import { StyleSheet } from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';

export default StyleSheet.create({
    dummy_navbar: {
        height: dimensions.sizeRatio * 65,
        backgroundColor: colors.theme,
    },

    main_separator_view: {
        top: dimensions.sizeRatio * -55,
        paddingLeft: dimensions.sizeRatio * 15,
        paddingRight: dimensions.sizeRatio * 15,
        // backgroundColor: colors.light_theme,
        height: dimensions.sizeRatio * 580,
    },

    live_session: {
        flex: 10, 
        backgroundColor: colors.white,
        borderRadius: dimensions.sizeRatio * 15,
        alignItems: 'center', 
    },

    live_icon: {
        top: dimensions.sizeRatio * 20,
        width: dimensions.sizeRatio * 105,
        height: dimensions.sizeRatio * 135,
    },

    live_text: {
        fontFamily: CONSTANTS.DEMI,
        top: dimensions.sizeRatio * 35,
        fontSize: dimensions.sizeRatio * 20,
        textAlign: 'center',
        width: dimensions.width,
        height: dimensions.sizeRatio * 25,
        color: colors.theme,
    },

    live_sub_text: {
        fontFamily: CONSTANTS.REGULAR,
        top: dimensions.sizeRatio * 45,
        fontSize: dimensions.sizeRatio * 13,
        textAlign: 'center',
        width: dimensions.width,
        height: dimensions.sizeRatio * 50,
        color: colors.lightblack,
    },

    separator_session: {
        flex: 1, 
        // backgroundColor: 'red',
    },

    recorded_session: {
        flex: 10, 
        backgroundColor: colors.white,
        borderRadius: dimensions.sizeRatio * 15,
        alignItems: 'center',
    },

    recorded_icon: {
        top: dimensions.sizeRatio * 35,
        width: dimensions.sizeRatio * 130,
        height: dimensions.sizeRatio * 118,
    },

    recorded_text: {
        fontFamily: CONSTANTS.DEMI,
        top: dimensions.sizeRatio * 53,
        fontSize: dimensions.sizeRatio * 20,
        textAlign: 'center',
        width: dimensions.width,
        height: dimensions.sizeRatio * 25,
        color: colors.theme,
    },

    recorded_sub_text: {
        fontFamily: CONSTANTS.REGULAR,
        top: dimensions.sizeRatio * 63,
        fontSize: dimensions.sizeRatio * 13,
        textAlign: 'center',
        width: dimensions.width,
        height: dimensions.sizeRatio * 50,
        color: colors.lightblack,
    },
});