import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  Platform
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
  const [timeRange, setTimeRange] = useState('weekly');
  
  const getMaxValue = (data) => {
    return Math.max(...data) + 1;
  };
  
  const renderBarChart = (data, labels) => {
    const maxValue = getMaxValue(data);
    
    return (
      <View className="bg-white rounded-xl p-4 flex-row h-52 shadow-sm" 
            style={{ 
              elevation: Platform.OS === 'android' ? 3 : 0,
              shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
              shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
              shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
              shadowRadius: Platform.OS === 'ios' ? 3 : 0,
            }}>
        <View className="w-8 justify-between py-3">
          {[...Array(5)].map((_, i) => {
            const value = Math.round((maxValue / 4) * (4 - i));
            return (
              <Text key={i} className="text-sm text-gray-500 text-center" 
                    style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                {value}
              </Text>
            );
          })}
        </View>
        
        <View className="flex-1 flex-row justify-around items-end pl-3">
          {data.map((value, index) => {
            const barHeight = Math.max((value / maxValue) * 150, 2); // Minimum height of 2
            return (
              <View key={index} className="items-center justify-end" style={{ minWidth: 32 }}>
                <View 
                  className="w-5 bg-blue-500 rounded-t-md"
                  style={{ 
                    height: barHeight,
                    minHeight: value > 0 ? 2 : 0 // Ensure visible bars for non-zero values
                  }}
                />
                <Text className="text-sm text-gray-500 mt-2" 
                      style={{ 
                        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                        textAlign: 'center'
                      }}>
                  {labels[index]}
                </Text>
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
      <View className="bg-white rounded-xl p-4 flex-row shadow-sm"
            style={{ 
              elevation: Platform.OS === 'android' ? 3 : 0,
              shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
              shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
              shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
              shadowRadius: Platform.OS === 'ios' ? 3 : 0,
            }}>
        <View className="flex-1 justify-center">
          {mockTriggerData.map((item, index) => {
            const percentage = Math.round((item.count / totalTriggers) * 100);
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
            
            return (
              <View key={index} className="flex-row items-center mb-3">
                <View className={`w-4 h-4 rounded-full mr-2 ${colors[index % colors.length]}`} />
                <Text className="text-base text-gray-800" 
                      style={{ 
                        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                        flex: 1
                      }}>
                  {item.trigger}: {percentage}%
                </Text>
              </View>
            );
          })}
        </View>
        
        <View className="w-32 h-32 justify-center items-center">
          <View className="w-32 h-32 rounded-full bg-gray-100 justify-center items-center"
                style={{ 
                  elevation: Platform.OS === 'android' ? 1 : 0,
                  shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                  shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 1 } : { width: 0, height: 0 },
                  shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                  shadowRadius: Platform.OS === 'ios' ? 2 : 0,
                }}>
            <Text className="text-lg font-bold text-gray-500" 
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
              Pie Chart
            </Text>
            <Text className="text-base text-gray-500" 
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
              Visualization
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  const renderTimeChart = () => {
    const totalEvents = mockTimeData.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm"
            style={{ 
              elevation: Platform.OS === 'android' ? 3 : 0,
              shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
              shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
              shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
              shadowRadius: Platform.OS === 'ios' ? 3 : 0,
            }}>
        {mockTimeData.map((item, index) => {
          const percentage = (item.count / totalEvents) * 100;
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
          
          return (
            <View key={index} className="mb-4">
              <Text className="text-lg font-medium text-gray-800 mb-1" 
                    style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                {item.time}
              </Text>
              <View className="h-6 bg-gray-100 rounded overflow-hidden flex-row items-center"
                    style={{ position: 'relative' }}>
                <View 
                  className={`h-full ${colors[index % colors.length]}`}
                  style={{ 
                    width: `${Math.max(percentage, 5)}%`, // Minimum width for visibility
                    minWidth: percentage > 0 ? 8 : 0
                  }}
                />
                <Text className="text-base font-bold text-gray-800"
                      style={{ 
                        position: 'absolute',
                        right: 8,
                        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
                      }}>
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
    <SafeAreaView className="flex-1 bg-blue-50" 
                  style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar 
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} 
        backgroundColor={Platform.OS === 'android' ? '#dbeafe' : undefined}
      />
      
      <View className="flex-row items-center justify-between p-4 bg-blue-50"
            style={{ 
              paddingTop: Platform.OS === 'ios' ? 16 : 8,
              minHeight: Platform.OS === 'ios' ? 60 : 56
            }}>
        <TouchableOpacity 
          className="p-2"
          onPress={() => router.push('/(tabs)')}
          style={{ 
            minWidth: 44, 
            minHeight: 44, 
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons name="arrow-back" size={28} color="#4A90E2" />
        </TouchableOpacity>
        
        <Text className="text-2xl font-bold text-gray-800" 
              style={{ 
                fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                flex: 1,
                textAlign: 'center'
              }}>
          Seizure Reports
        </Text>
        
        <TouchableOpacity 
          className="p-2"
          style={{ 
            minWidth: 44, 
            minHeight: 44, 
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons name="share-outline" size={28} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, marginBottom: Platform.OS === 'ios' ? 90 : 80 }}>
        <ScrollView 
          className="p-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className="flex-row bg-white rounded-lg mb-5 shadow-sm overflow-hidden"
                style={{ 
                  elevation: Platform.OS === 'android' ? 2 : 0,
                  shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                  shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 1 } : { width: 0, height: 0 },
                  shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                  shadowRadius: Platform.OS === 'ios' ? 2 : 0,
                }}>
            {['weekly', 'monthly', 'yearly'].map((range) => (
              <TouchableOpacity 
                key={range}
                className={`flex-1 py-3 items-center justify-center ${timeRange === range ? 'bg-blue-500' : ''}`}
                onPress={() => setTimeRange(range)}
                style={{ minHeight: 48 }}
              >
                <Text className={`text-lg font-medium ${timeRange === range ? 'text-white font-bold' : 'text-gray-500'}`}
                      style={{ 
                        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                        textTransform: 'capitalize'
                      }}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-4" 
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
              Seizure Frequency
            </Text>
            {renderBarChart(mockSeizureData[timeRange], getChartLabels())}
          </View>

          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-4" 
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
              Seizure Triggers
            </Text>
            {renderTriggerChart()}
          </View>

          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-4" 
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
              Time of Day Analysis
            </Text>
            {renderTimeChart()}
          </View>

          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-4" 
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
              Summary
            </Text>
            <View className="bg-white rounded-xl p-4 shadow-sm"
                  style={{ 
                    elevation: Platform.OS === 'android' ? 3 : 0,
                    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
                    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                    shadowRadius: Platform.OS === 'ios' ? 3 : 0,
                  }}>
              <View className="flex-row mb-4">
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-blue-500 mb-1" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    30
                  </Text>
                  <Text className="text-lg text-gray-500 text-center" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Total Seizures
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-blue-500 mb-1" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    2.5
                  </Text>
                  <Text className="text-lg text-gray-500 text-center" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Avg. Duration (min)
                  </Text>
                </View>
              </View>
              
              <View className="flex-row">
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-blue-500 mb-1" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    8
                  </Text>
                  <Text className="text-lg text-gray-500 text-center" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Longest Seizure-Free (days)
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-blue-500 mb-1" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    85%
                  </Text>
                  <Text className="text-lg text-gray-500 text-center" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Medication Adherence
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            className="bg-green-500 rounded-lg p-4 flex-row items-center justify-center mt-2 mb-10"
            style={{ 
              minHeight: 56,
              elevation: Platform.OS === 'android' ? 3 : 0,
              shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
              shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
              shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0,
              shadowRadius: Platform.OS === 'ios' ? 4 : 0,
            }}
          >
            <Ionicons name="download-outline" size={28} color="white" />
            <Text className="text-white text-xl font-medium ml-2" 
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
              Export Report for Doctor
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}