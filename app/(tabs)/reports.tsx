import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Mock data for charts
const mockSeizureData = {
  weekly: [3, 2, 4, 1, 2, 0, 1],
  monthly: [12, 9, 15, 8],
  yearly: [120, 95, 105, 85, 110, 75, 90, 100, 85, 70, 80, 95]
};

const mockTriggerData = [
  { trigger: 'Missed medication', count: 8 },
  { trigger: 'Lack of sleep', count: 6 },
  { trigger: 'Stress', count: 4 },
  { trigger: 'Fever', count: 3 },
  { trigger: 'Unknown', count: 9 }
];

const mockTimeData = [
  { time: 'Morning (6am-12pm)', count: 12 },
  { time: 'Afternoon (12pm-6pm)', count: 8 },
  { time: 'Evening (6pm-12am)', count: 15 },
  { time: 'Night (12am-6am)', count: 5 }
];

export default function ReportsScreen() {
  const navigation = useNavigation();
  const [timeRange, setTimeRange] = useState('weekly'); // 'weekly', 'monthly', 'yearly'
  
  const getMaxValue = (data) => {
    return Math.max(...data) + 1;
  };
  
  const renderBarChart = (data, labels) => {
    const maxValue = getMaxValue(data);
    
    return (
      <View className="bg-white rounded-xl p-4 flex-row h-52 shadow-sm">
        <View className="w-8 justify-between py-3">
          {[...Array(5)].map((_, i) => {
            const value = Math.round((maxValue / 4) * (4 - i));
            return (
              <Text key={i} className="text-base text-gray-500 text-center">{value}</Text>
            );
          })}
        </View>
        
        <View className="flex-1 flex-row justify-around items-end pl-3">
          {data.map((value, index) => {
            const barHeight = (value / maxValue) * 150;
            return (
              <View key={index} className="items-center justify-end w-8">
                <View 
                  className="w-5 bg-blue-500 rounded-t-md"
                  style={{ height: barHeight }}
                />
                <Text className="text-base text-gray-500 mt-2">{labels[index]}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };
  
  const renderTriggerChart = () => {
    const totalTriggers = mockTriggerData.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <View className="bg-white rounded-xl p-4 flex-row shadow-sm">
        <View className="flex-1 justify-center">
          {mockTriggerData.map((item, index) => {
            const percentage = Math.round((item.count / totalTriggers) * 100);
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
            
            return (
              <View key={index} className="flex-row items-center mb-3">
                <View className={`w-4 h-4 rounded-full mr-2 ${colors[index % colors.length]}`} />
                <Text className="text-base text-gray-800">{item.trigger}: {percentage}%</Text>
              </View>
            );
          })}
        </View>
        
        <View className="w-32 h-32 justify-center items-center">
          <View className="w-32 h-32 rounded-full bg-gray-100 justify-center items-center">
            <Text className="text-lg font-bold text-gray-500">Pie Chart</Text>
            <Text className="text-base text-gray-500">Visualization</Text>
          </View>
        </View>
      </View>
    );
  };
  
  const renderTimeChart = () => {
    const totalEvents = mockTimeData.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm">
        {mockTimeData.map((item, index) => {
          const percentage = (item.count / totalEvents) * 100;
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
          
          return (
            <View key={index} className="mb-4">
              <Text className="text-lg font-medium text-gray-800 mb-1">{item.time}</Text>
              <View className="h-6 bg-gray-100 rounded overflow-hidden flex-row items-center">
                <View 
                  className={`h-full ${colors[index % colors.length]}`}
                  style={{ width: `${percentage}%` }}
                />
                <Text className="absolute right-2 text-base font-bold text-gray-800">
                  {Math.round(percentage)}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };
  
  const getChartLabels = () => {
    if (timeRange === 'weekly') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (timeRange === 'monthly') {
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    } else {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-row items-center justify-between p-4 bg-blue-50">
        <TouchableOpacity 
          className="p-2"
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="arrow-back" size={28} color="#4A90E2" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Seizure Reports</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="share-outline" size={28} color="#4A90E2" />
        </TouchableOpacity>
      </View>

<View style={{ flex: 1, overflow: 'hidden', marginBottom: 90 }}>
      <ScrollView className="p-4">
        <View className="flex-row bg-white rounded-lg mb-5 shadow-sm overflow-hidden">
          <TouchableOpacity 
            className={`flex-1 py-3 items-center ${timeRange === 'weekly' ? 'bg-blue-500' : ''}`}
            onPress={() => setTimeRange('weekly')}
          >
            <Text className={`text-lg font-medium ${timeRange === 'weekly' ? 'text-white font-bold' : 'text-gray-500'}`}>
              Weekly
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 py-3 items-center ${timeRange === 'monthly' ? 'bg-blue-500' : ''}`}
            onPress={() => setTimeRange('monthly')}
          >
            <Text className={`text-lg font-medium ${timeRange === 'monthly' ? 'text-white font-bold' : 'text-gray-500'}`}>
              Monthly
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 py-3 items-center ${timeRange === 'yearly' ? 'bg-blue-500' : ''}`}
            onPress={() => setTimeRange('yearly')}
          >
            <Text className={`text-lg font-medium ${timeRange === 'yearly' ? 'text-white font-bold' : 'text-gray-500'}`}>
              Yearly
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Seizure Frequency</Text>
          {renderBarChart(mockSeizureData[timeRange], getChartLabels())}
        </View>

        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Seizure Triggers</Text>
          {renderTriggerChart()}
        </View>

        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Time of Day Analysis</Text>
          {renderTimeChart()}
        </View>

        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Summary</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row mb-4">
              <View className="flex-1 items-center">
                <Text className="text-3xl font-bold text-blue-500 mb-1">30</Text>
                <Text className="text-lg text-gray-500 text-center">Total Seizures</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-3xl font-bold text-blue-500 mb-1">2.5</Text>
                <Text className="text-lg text-gray-500 text-center">Avg. Duration (min)</Text>
              </View>
            </View>
            
            <View className="flex-row">
              <View className="flex-1 items-center">
                <Text className="text-3xl font-bold text-blue-500 mb-1">8</Text>
                <Text className="text-lg text-gray-500 text-center">Longest Seizure-Free (days)</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-3xl font-bold text-blue-500 mb-1">85%</Text>
                <Text className="text-lg text-gray-500 text-center">Medication Adherence</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity className="bg-green-500 rounded-lg p-4 flex-row items-center justify-center mt-2 mb-10">
          <Ionicons name="download-outline" size={28} color="white" />
          <Text className="text-white text-xl font-medium ml-2">Export Report for Doctor</Text>
        </TouchableOpacity>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}