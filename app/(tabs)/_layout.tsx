import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <TabIcon name="feed" color={color} />,
        }}
      />
      <Tabs.Screen
        name="post-ride"
        options={{
          title: 'Post Ride',
          tabBarIcon: ({ color }) => <TabIcon name="add" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <TabIcon name="chat" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="profile" color={color} />,
        }}
      />
    </Tabs>
  );
}

// Simple icon component using emojis
function TabIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, string> = {
    feed: '🏠',
    add: '➕',
    chat: '💬',
    profile: '👤',
  };

  return (
    <Text style={{ fontSize: 24 }}>
      {icons[name] || '◯'}
    </Text>
  );
}

