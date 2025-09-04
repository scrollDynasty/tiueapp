import { useThemeColor } from '@/hooks/useThemeColor';
import { addTask, updateTask } from '@/store/slices/tasksSlice';
import { tasksStyles } from '@/styles/screens/tasks';
import { Task } from '@/types';
import {
    selectTasksItems
} from '@/types/redux';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function TasksScreen() {
  const dispatch = useDispatch();
  const allTasks = useSelector(selectTasksItems);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const cardBackgroundColor = useThemeColor({ light: '#fff', dark: '#2a2a2a' }, 'background');

  const filteredTasks = selectedFilter === 'all' 
    ? allTasks 
    : allTasks.filter((task: Task) => 
        selectedFilter === 'completed' ? task.completed : !task.completed
      );

  const filters = [
    { key: 'all', label: 'Все', count: allTasks.length },
    { key: 'pending', label: 'В процессе', count: allTasks.filter((t: Task) => !t.completed).length },
    { key: 'completed', label: 'Выполнено', count: allTasks.filter((t: Task) => t.completed).length },
  ];

  const priorityColors = {
    high: '#ff4757',
    medium: '#ffa502', 
    low: '#2ed573',
  };

  const handleToggleTask = (taskId: string) => {
    const task = allTasks.find((t: Task) => t.id === taskId);
    if (task) {
      dispatch(updateTask({
        id: taskId,
        updates: { completed: !task.completed }
      }));
    }
  };

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        subject: newTask.subject,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        completed: false,
        type: 'homework',
      };
      dispatch(addTask(task));
      setNewTask({
        title: '',
        description: '',
        subject: '',
        dueDate: '',
        priority: 'medium',
      });
      setModalVisible(false);
    }
  };

  const renderTaskCard = ({ item }: { item: Task }) => (
    <View style={[tasksStyles.taskCard, { backgroundColor: cardBackgroundColor }]}>
      <TouchableOpacity
        style={[
          tasksStyles.checkbox,
          { 
            backgroundColor: item.completed ? '#2ed573' : 'transparent',
            borderColor: item.completed ? '#2ed573' : '#ddd',
          }
        ]}
        onPress={() => handleToggleTask(item.id)}
      >
        {item.completed && (
          <Ionicons name="checkmark" size={18} color="white" />
        )}
      </TouchableOpacity>

      <View style={tasksStyles.taskContent}>
        <View style={tasksStyles.taskHeader}>
          <Text 
            style={[
              tasksStyles.taskTitle, 
              { 
                color: textColor,
                textDecorationLine: item.completed ? 'line-through' : 'none',
                opacity: item.completed ? 0.6 : 1,
              }
            ]}
          >
            {item.title}
          </Text>
          <View 
            style={[
              tasksStyles.priorityBadge, 
              { backgroundColor: priorityColors[item.priority] }
            ]}
          >
            <Text style={tasksStyles.priorityText}>
              {item.priority === 'high' ? 'Высокий' : 
               item.priority === 'medium' ? 'Средний' : 'Низкий'}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text style={[tasksStyles.taskDescription, { color: textColor, opacity: 0.7 }]}>
            {item.description}
          </Text>
        )}

        <View style={tasksStyles.taskFooter}>
          <Text style={[tasksStyles.taskSubjectText, { color: primaryColor }]}>
            {item.subject}
          </Text>
          {item.dueDate && (
            <Text 
              style={[
                tasksStyles.taskDueDate, 
                { 
                  color: textColor,
                  opacity: 0.6 
                }
              ]}
            >
              {new Date(item.dueDate).toLocaleDateString('ru-RU')}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={tasksStyles.menuButton}
        onPress={() => {/* TODO: Implement task menu */}}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={textColor} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[tasksStyles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={tasksStyles.header}>
        <Text style={[tasksStyles.title, { color: textColor }]}>Задачи</Text>
        <TouchableOpacity
          style={[tasksStyles.addButton, { backgroundColor: primaryColor }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={tasksStyles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tasksStyles.filterScrollView}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                tasksStyles.filterButton,
                {
                  backgroundColor: selectedFilter === filter.key ? primaryColor : 'transparent',
                  borderColor: primaryColor,
                }
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Text
                style={[
                  tasksStyles.filterButtonText,
                  {
                    color: selectedFilter === filter.key ? 'white' : primaryColor,
                  }
                ]}
              >
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tasksStyles.listContainer}
      />

      {/* Add Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tasksStyles.modalContainer}>
          <View style={[tasksStyles.modalContent, { backgroundColor: cardBackgroundColor }]}>
            <View style={tasksStyles.modalHeader}>
              <Text style={[tasksStyles.modalTitle, { color: textColor }]}>Новая задача</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[tasksStyles.input, { color: textColor, borderColor: primaryColor }]}
              placeholder="Название задачи"
              placeholderTextColor={textColor + '80'}
              value={newTask.title}
              onChangeText={(text) => setNewTask(prev => ({ ...prev, title: text }))}
            />

            <TextInput
              style={[tasksStyles.input, tasksStyles.textArea, { color: textColor, borderColor: primaryColor }]}
              placeholder="Описание"
              placeholderTextColor={textColor + '80'}
              value={newTask.description}
              onChangeText={(text) => setNewTask(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={[tasksStyles.input, { color: textColor, borderColor: primaryColor }]}
              placeholder="Предмет"
              placeholderTextColor={textColor + '80'}
              value={newTask.subject}
              onChangeText={(text) => setNewTask(prev => ({ ...prev, subject: text }))}
            />

            <View style={tasksStyles.modalButtons}>
              <TouchableOpacity
                style={[tasksStyles.modalButton, tasksStyles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={tasksStyles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[tasksStyles.modalButton, { backgroundColor: primaryColor }]}
                onPress={handleAddTask}
              >
                <Text style={tasksStyles.addButtonText}>Добавить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
