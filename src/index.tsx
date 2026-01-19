import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import RegisterScreen from './screens/auth/register';
import LoginScreen from './screens/auth/login';

import SplashScreen from './screens/Splash';
import OfflineChessScreen from './screens/off/OfflineChessScreen';
import DynamoChess from './screens/chess';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TournamentDetails from './screens/TournamentDetails';
import TournamentList from './screens/TournamentList';
import MiddleScreen from './screens/MiddleScree';
import Home from './screens/Home/Home';
import Home1 from './screens/Home1';
import ChessGame from './screens/chess';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Automatically retry failed calls twice
      staleTime: 1000 * 60, // Data stays "fresh" for 1 minute
    },
  },
});
function MyStack() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name='TournamentDetails' component={TournamentDetails} />
          <Stack.Screen name='Splash' component={SplashScreen} />
          <Stack.Screen name='Login' component={LoginScreen} />
          <Stack.Screen name='Register' component={RegisterScreen} />
          <Stack.Screen name='Home' component={Home} />
          <Stack.Screen name='Home1' component={Home1} />
          <Stack.Screen name='ChessGame' component={ChessGame} />
          <Stack.Screen name='TournamentList' component={TournamentList} />
          <Stack.Screen name='MiddleScreen' component={MiddleScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
export default MyStack;