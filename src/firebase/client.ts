// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyCngs4aUiad_CaUQOO6rLDjREwa77eA5_A",
	authDomain: "stastro-proj.firebaseapp.com",
	projectId: "stastro-proj",
	storageBucket: "stastro-proj.appspot.com",
	messagingSenderId: "96681191007",
	appId: "1:96681191007:web:690c0cf1534b8fd10e9dea"
};

// Initialize Firebase
export const fbApp = initializeApp(firebaseConfig);