/**
 * 앱 네비게이션 설정
 * Bottom Tab (홈, 통계, 설정) + Stack (모달/상세)
 * V4 트렌디 UI
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet} from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import AddActivityScreen from '../screens/AddActivityScreen';
import DetailsScreen from '../screens/DetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import {COLORS} from '../utils/theme';

export type RootStackParamList = {
  MainTabs: undefined;
  AddActivity: undefined;
  Details: undefined;
};

export type TabParamList = {
  Home: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabIcon = ({
  label,
  focused,
}: {
  label: string;
  focused: boolean;
}) => (
  <View style={tabStyles.iconContainer}>
    <Text style={[tabStyles.icon, {opacity: focused ? 1 : 0.4}]}>{label}</Text>
    {focused && <View style={tabStyles.dot} />}
  </View>
);

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '피로도',
          tabBarIcon: ({focused}) => <TabIcon label="🔋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: '통계',
          tabBarIcon: ({focused}) => <TabIcon label="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '설정',
          tabBarIcon: ({focused}) => <TabIcon label="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginTop: 2,
  },
});

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.accent,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AddActivity"
          component={AddActivityScreen}
          options={{
            title: '활동 추가',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{
            title: '상세 보기',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
