import React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import Animated, { FadeInDown, SlideInLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, Typography, Shadows } from '@/constants/DesignTokens';

interface ChatItemProps {
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  avatar?: string;
  index: number;
}

function ChatItem({ name, lastMessage, time, unread = 0, online = false, index }: ChatItemProps) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <Pressable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: Spacing.m,
          backgroundColor: Colors.surface,
          borderRadius: 16,
          marginBottom: Spacing.s,
          ...Shadows.card,
        }}
      >
        {/* Аватар */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: Colors.brandPrimary10,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: Spacing.m,
            position: 'relative',
          }}
        >
          <Ionicons name="person" size={24} color={Colors.brandPrimary} />
          {online && (
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#10B981',
                position: 'absolute',
                bottom: 0,
                right: 0,
                borderWidth: 2,
                borderColor: Colors.surface,
              }}
            />
          )}
        </View>

        {/* Контент */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: Colors.textPrimary,
              }}
            >
              {name}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 12,
                color: Colors.textSecondary,
              }}
            >
              {time}
            </ThemedText>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <ThemedText
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {lastMessage}
            </ThemedText>
            
            {unread > 0 && (
              <View
                style={{
                  backgroundColor: Colors.brandPrimary,
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 6,
                  marginLeft: Spacing.s,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: Colors.surface,
                  }}
                >
                  {unread > 99 ? '99+' : unread.toString()}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function MessagesScreen() {
  const chats = [
    {
      id: 1,
      name: "Анна Петрова",
      lastMessage: "Привет! Когда у нас семинар?",
      time: "14:30",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Группа ИТ-21",
      lastMessage: "Михаил: Кто был на лекции?",
      time: "13:15",
      unread: 5,
      online: false,
    },
    {
      id: 3,
      name: "Преподаватель Иванов",
      lastMessage: "Задание загружено в систему",
      time: "12:00",
      unread: 1,
      online: true,
    },
    {
      id: 4,
      name: "Староста курса",
      lastMessage: "Собрание завтра в 15:00",
      time: "11:30",
      unread: 0,
      online: false,
    },
    {
      id: 5,
      name: "Библиотека",
      lastMessage: "Книга готова к выдаче",
      time: "10:45",
      unread: 0,
      online: false,
    },
    {
      id: 6,
      name: "Деканат",
      lastMessage: "Документы готовы",
      time: "Вчера",
      unread: 0,
      online: false,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Заголовок */}
      <Animated.View 
        entering={SlideInLeft.duration(400)}
        style={{ 
          paddingHorizontal: Spacing.l, 
          paddingVertical: Spacing.l,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <ThemedText
            style={{
              ...Typography.displayH1,
              color: Colors.textPrimary,
              marginBottom: Spacing.xxs,
            }}
          >
            Сообщения
          </ThemedText>
          <ThemedText
            style={{
              ...Typography.body,
              color: Colors.textSecondary,
            }}
          >
            {chats.reduce((sum, chat) => sum + chat.unread, 0)} новых сообщений
          </ThemedText>
        </View>

        <Pressable
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.brandPrimary10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="add" size={24} color={Colors.brandPrimary} />
        </Pressable>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.l,
          paddingBottom: 100,
        }}
      >
        {/* Быстрые действия */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={{ marginBottom: Spacing.l }}
        >
          <View style={{ flexDirection: 'row', gap: Spacing.s }}>
            <Pressable
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.surfaceSubtle,
                borderRadius: 12,
                padding: Spacing.s,
              }}
            >
              <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
              <ThemedText
                style={{
                  fontSize: 14,
                  color: Colors.textSecondary,
                  marginLeft: Spacing.xs,
                }}
              >
                Поиск
              </ThemedText>
            </Pressable>

            <Pressable
              style={{
                backgroundColor: Colors.chipBg,
                borderRadius: 12,
                paddingHorizontal: Spacing.s,
                paddingVertical: Spacing.xs,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="filter-outline" size={16} color={Colors.brandPrimary} />
              <ThemedText
                style={{
                  fontSize: 14,
                  color: Colors.brandPrimary,
                  marginLeft: Spacing.xxs,
                }}
              >
                Все
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>

        {/* Список чатов */}
        <View>
          {chats.map((chat, index) => (
            <ChatItem
              key={chat.id}
              name={chat.name}
              lastMessage={chat.lastMessage}
              time={chat.time}
              unread={chat.unread}
              online={chat.online}
              index={index}
            />
          ))}
        </View>

        {/* Заглушка если нет сообщений */}
        <Animated.View 
          entering={FadeInDown.delay(800)}
          style={{
            alignItems: 'center',
            padding: Spacing.xl,
            marginTop: Spacing.l,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: Colors.surfaceSubtle,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Spacing.m,
            }}
          >
            <Ionicons name="chatbubbles-outline" size={40} color={Colors.textSecondary} />
          </View>
          
          <ThemedText
            style={{
              ...Typography.body,
              color: Colors.textSecondary,
              textAlign: 'center',
            }}
          >
            Начните общение с одногруппниками и преподавателями
          </ThemedText>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
