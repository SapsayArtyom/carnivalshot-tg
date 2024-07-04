import * as firebase from "firebase/app"
import firestore from 'firebase/firestore'
import "firebase/analytics"
import "firebase/functions"
const config = {
    apiKey: "AIzaSyDCuNcaaw5YCcSIAYcVqHIuzDiWYSmXRYM",
    authDomain: "carnival-extension.firebaseapp.com",
    databaseURL: "https://carnival-extension.firebaseio.com",
    projectId: "carnival-extension",
    storageBucket: "carnival-extension.appspot.com",
    messagingSenderId: "611984942288",
    appId: "1:611984942288:web:10392e28db06d0b751ead5",
    measurementId: "G-NZKXXWM5YJ"
};

firebase.initializeApp(config);

//firebase.analyticsRunner = firebase.analytics()
//firebase.firestore().settings(settings);

export default firebase;