/**
 * 앱 네비게이션 설정
 * Bottom Tab (홈, 기록, 옷장, 마이) + Stack (모달/상세)
 * V5 뿜 캐릭터 시스템
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import RecordsScreen from '../screens/RecordsScreen';
import ClosetScreen from '../screens/ClosetScreen';
import MyScreen from '../screens/MyScreen';
import AddActivityScreen from '../screens/AddActivityScreen';
import DetailsScreen from '../screens/DetailsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import {useSettings} from '../contexts/SettingsContext';
import {useTheme} from '../contexts/ThemeContext';
import {COLORS} from '../utils/theme';

export type RootStackParamList = {
  MainTabs: undefined;
  AddActivity: undefined;
  Details: undefined;
};

export type TabParamList = {
  Home: undefined;
  Records: undefined;
  Closet: undefined;
  My: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabIcon = ({
  label,
  focused,
  color,
}: {
  label: string;
  focused: boolean;
  color: string;
}) => (
  <View style={tabStyles.iconContainer}>
    <Text style={[tabStyles.icon, {opacity: focused ? 1 : 0.4}]}>{label}</Text>
    {focused && <View style={[tabStyles.dot, {backgroundColor: color}]} />}
  </View>
);

const MainTabs: React.FC = () => {
  const {colors, isDark} = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({focused, color}) => <TabIcon label="🏠" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Records"
        component={RecordsScreen}
        options={{
          tabBarLabel: '기록',
          tabBarIcon: ({focused, color}) => <TabIcon label="📅" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Closet"
        component={ClosetScreen}
        options={{
          tabBarLabel: '옷장',
          tabBarIcon: ({focused, color}) => <TabIcon label="👕" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="My"
        component={MyScreen}
        options={{
          tabBarLabel: '마이',
          tabBarIcon: ({focused, color}) => <TabIcon label="👤" focused={focused} color={color} />,
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
  const {settings, isLoading, completeOnboarding} = useSettings();
  const {colors} = useTheme();

  if (isLoading) {
    return (
      <View style={[loadingStyles.container, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!settings.onboardingComplete) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.accent,
          },
          headerTintColor: colors.white,
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

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default AppNavigator;
