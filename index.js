import { registerRootComponent } from 'expo';
import 'react-native-url-polyfill/auto';

import App from './App';

/**
 * Registers the root component of the application.
 * 
 * @description This function is used to register the main component of the application.
 * It ensures that the environment is set up correctly whether the app is run in Expo Go or a native build.
 * 
 * @param {Component} component - The root component of the application.
 */
const registerApp = (component) => {
  if (component) {
    registerRootComponent(component);
  } else {
    throw new Error('Root component is required');
  }
};

registerApp(App);