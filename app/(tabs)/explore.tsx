import { UniversityCard } from '@/components/ui/UniversityCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Исследовать</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Откройте для себя возможности университета
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Категории</Text>
          
          <View style={styles.categoriesGrid}>
            <UniversityCard
              title="Факультеты"
              icon="school"
              gradient="primary"
              size="medium"
              style={styles.categoryCard}
            />
            
            <UniversityCard
              title="Библиотека"
              icon="library"
              gradient="accent"
              size="medium"
              style={styles.categoryCard}
            />
          </View>

          <View style={styles.categoriesGrid}>
            <UniversityCard
              title="Спорт"
              icon="fitness"
              gradient="secondary"
              size="medium"
              style={styles.categoryCard}
            />
            
            <UniversityCard
              title="Клубы"
              icon="people"
              gradient="purple"
              size="medium"
              style={styles.categoryCard}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Новости университета</Text>
          
          <View style={[styles.newsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.newsTitle, { color: colors.text }]}>
              Открытие новой лаборатории
            </Text>
            <Text style={[styles.newsText, { color: colors.textSecondary }]}>
              В университете открылась современная лаборатория искусственного интеллекта
            </Text>
          </View>

          <View style={[styles.newsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.newsTitle, { color: colors.text }]}>
              Студенческий фестиваль
            </Text>
            <Text style={[styles.newsText, { color: colors.textSecondary }]}>
              25 октября состоится ежегодный студенческий фестиваль науки и искусства
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  categoryCard: {
    flex: 1,
  },
  newsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  newsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
