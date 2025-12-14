import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import Register from './screens/auth/register';
import LoginScreen from './screens/auth/login';


const Stack = createNativeStackNavigator();

function MyStack() {
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName="Register" screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Register' component={Register} />
      {/* <Stack.Screen name='Home' component={LoginScreen} /> */}
    </Stack.Navigator>
    </NavigationContainer>
  );
}
export default MyStack;