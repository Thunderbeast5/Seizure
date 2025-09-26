import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Image,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock data for educational content
const CATEGORIES = [
  { id: '1', name: 'Seizure Types', icon: 'medical' },
  { id: '2', name: 'First Aid', icon: 'medkit' },
  { id: '3', name: 'Medications', icon: 'flask' },
  { id: '4', name: 'Lifestyle', icon: 'sunny' },
  { id: '5', name: 'School', icon: 'school' },
  { id: '6', name: 'Research', icon: 'library' },
];

const FEATURED_ARTICLES = [
  {
    id: '1',
    title: 'Understanding Pediatric Epilepsy',
    summary: 'Learn about the basics of epilepsy in children and how it differs from adult epilepsy.',
    imageUrl: 'https://api.a0.dev/assets/image?text=Understanding%20Pediatric%20Epilepsy&aspect=16:9',
    readTime: '5 min read',
    category: 'Basics'
  },
  {
    id: '2',
    title: 'Seizure First Aid for Parents',
    summary: 'Essential steps every parent should know when their child has a seizure.',
    imageUrl: 'https://api.a0.dev/assets/image?text=Seizure%20First%20Aid&aspect=16:9',
    readTime: '4 min read',
    category: 'First Aid'
  },
  {
    id: '3',
    title: 'Medication Side Effects to Watch For',
    summary: 'Common side effects of anti-seizure medications and when to contact your doctor.',
    imageUrl: 'https://api.a0.dev/assets/image?text=Medication%20Side%20Effects&aspect=16:9',
    readTime: '7 min read',
    category: 'Medications'
  }
];

const RECENT_ARTICLES = [
  {
    id: '4',
    title: 'School Accommodations for Children with Epilepsy',
    summary: 'How to work with schools to ensure your child gets proper support and accommodations.',
    imageUrl: 'https://api.a0.dev/assets/image?text=School%20Accommodations&aspect=16:9',
    readTime: '6 min read',
    category: 'School'
  },
  {
    id: '5',
    title: 'Sleep and Seizures: What Parents Should Know',
    summary: 'The important relationship between sleep quality and seizure control in children.',
    imageUrl: 'https://api.a0.dev/assets/image?text=Sleep%20and%20Seizures&aspect=16:9',
    readTime: '5 min read',
    category: 'Lifestyle'
  },
  {
    id: '6',
    title: 'New Research in Pediatric Epilepsy Treatment',
    summary: 'Recent advances in treating childhood epilepsy and promising research directions.',
    imageUrl: 'https://api.a0.dev/assets/image?text=New%20Research&aspect=16:9',
    readTime: '8 min read',
    category: 'Research'
  }
];

export default function EducationScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  
  const renderCategoryItem = (category) => (
    <TouchableOpacity 
      key={category.id} 
      className="w-[30%] bg-white rounded-xl p-4 items-center mb-4 shadow-sm"
      onPress={() => {
        // Navigate to category view
      }}
    >
      <View className="w-14 h-14 rounded-full bg-blue-50 justify-center items-center mb-3">
        <Ionicons name={category.icon} size={28} color="#4A90E2" />
      </View>
      <Text className="text-lg font-medium text-slate-800 text-center">
        {category.name}
      </Text>
    </TouchableOpacity>
  );
  
  const renderArticleCard = (article, isFeatured = false) => (
    <TouchableOpacity 
      key={article.id} 
      className={`bg-white rounded-xl overflow-hidden mb-4 shadow-sm ${isFeatured ? 'w-72 mr-4' : ''}`}
      onPress={() => {
        // Navigate to article detail view
      }}
    >
      <Image 
        source={{ uri: article.imageUrl }}
        className={`w-full ${isFeatured ? 'h-40' : 'h-32'}`}
        resizeMode="cover"
      />
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-3">
          <View className="bg-blue-50 py-1 px-2 rounded">
            <Text className="text-lg text-blue-600 font-medium">
              {article.category}
            </Text>
          </View>
          <Text className="text-base text-gray-500">{article.readTime}</Text>
        </View>
        <Text className={`${isFeatured ? 'text-xl' : 'text-lg'} font-bold text-slate-800 mb-2`}>
          {article.title}
        </Text>
        {isFeatured && (
          <Text className="text-lg text-gray-600 leading-6" numberOfLines={2}>
            {article.summary}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: '#E6F3F8',
        paddingTop: Platform.OS === 'android' ? 0 : undefined 
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#E6F3F8" />
      {/* Header */}
      <View 
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: Platform.OS === 'android' ? Math.max(insets.top + 35, 55) : 32,
          marginBottom: Platform.OS === 'android' ? 15 : 10,
          paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
          justifyContent: 'space-between',
          backgroundColor: Platform.OS === 'android' ? 'transparent' : undefined,
          width: '100%',
        }}
      >
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{
            padding: Platform.OS === 'android' ? 12 : 0,
            minWidth: Platform.OS === 'android' ? 48 : 32,
            minHeight: Platform.OS === 'android' ? 48 : 32,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Platform.OS === 'android' ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
            borderRadius: Platform.OS === 'android' ? 8 : 0,
          }}
        >
          <Ionicons name="arrow-back" size={Platform.OS === 'android' ? 28 : 32} color="#4A90E2" />
        </TouchableOpacity>
        
        {/* Title */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text 
            style={{
              fontSize: Platform.OS === 'android' ? 26 : 30,
              fontWeight: 'bold',
              color: '#1E293B',
              textAlign: 'center',
            }}
          >
            Education
          </Text>
        </View>
        
        {/* Search Button */}
        <TouchableOpacity 
          style={{
            padding: Platform.OS === 'android' ? 12 : 0,
            minWidth: Platform.OS === 'android' ? 48 : 32,
            minHeight: Platform.OS === 'android' ? 48 : 32,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Platform.OS === 'android' ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
            borderRadius: Platform.OS === 'android' ? 8 : 0,
          }}
        >
          <Ionicons name="search" size={Platform.OS === 'android' ? 28 : 32} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ paddingHorizontal: 16 }}>
        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-800 mb-4">Categories</Text>
          <View className="flex-row flex-wrap justify-between">
            {CATEGORIES.map(renderCategoryItem)}
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-slate-800">Featured Articles</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-lg text-blue-600 mr-1">View All</Text>
              <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pr-4"
          >
            {FEATURED_ARTICLES.map(article => renderArticleCard(article, true))}
          </ScrollView>
        </View>

        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-slate-800">Recent Articles</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-lg text-blue-600 mr-1">View All</Text>
              <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>
          
          <View>
            {RECENT_ARTICLES.map(article => renderArticleCard(article))}
          </View>
        </View>

        <View className="mb-6">
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center mb-4">
              <Ionicons name="shield-checkmark" size={28} color="#27AE60" />
              <Text className="text-2xl font-bold text-green-600 ml-3">Safety Tips</Text>
            </View>
            
            <View className="mb-4">
              <View className="flex-row items-start mb-4">
                <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                <Text className="text-lg text-slate-800 ml-3 flex-1 leading-6">
                  Ensure your child wears a medical ID bracelet
                </Text>
              </View>
              
              <View className="flex-row items-start mb-4">
                <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                <Text className="text-lg text-slate-800 ml-3 flex-1 leading-6">
                  Inform teachers and caregivers about your child's condition
                </Text>
              </View>
              
              <View className="flex-row items-start mb-4">
                <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                <Text className="text-lg text-slate-800 ml-3 flex-1 leading-6">
                  Create a seizure action plan and share it with all caregivers
                </Text>
              </View>
              
              <View className="flex-row items-start mb-4">
                <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                <Text className="text-lg text-slate-800 ml-3 flex-1 leading-6">
                  Use shower seats and avoid bathtubs for children with frequent seizures
                </Text>
              </View>
              
              <View className="flex-row items-start mb-4">
                <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                <Text className="text-lg text-slate-800 ml-3 flex-1 leading-6">
                  Consider protective headgear for children with drop seizures
                </Text>
              </View>
            </View>
            
            <TouchableOpacity className="flex-row items-center justify-center py-2 border-t border-gray-100">
              <Text className="text-lg text-green-600 font-medium mr-1">
                View More Safety Tips
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#27AE60" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}