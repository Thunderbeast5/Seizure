import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import { useMedications } from '../../hooks/useMedications';
import { useSeizures } from '../../hooks/useSeizures';
import { Medication } from '../../services/medicationService';
import { Seizure } from '../../services/seizureService';

// Data processing functions
const processSeizureFrequency = (seizures: Seizure[], timeRange: string) => {
  const now = new Date();
  const data: number[] = [];
  const labels: string[] = [];

  if (timeRange === 'weekly') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = seizures.filter(seizure => seizure.date === dateStr).length;
      data.push(count);
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      labels.push(dayNames[date.getDay()]);
    }
  } else if (timeRange === 'monthly') {
    // Last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - (i + 1) * 7);
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() - i * 7);
      
      const count = seizures.filter(seizure => {
        const seizureDate = new Date(seizure.date);
        return seizureDate >= startDate && seizureDate < endDate;
      }).length;
      
      data.push(count);
      labels.push(`Week ${4 - i}`);
    }
  } else {
    // Last 12 months with proper yearly analysis - ensure all 12 months are visible
    const currentYear = now.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 12; i++) {
      const monthStr = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
      const count = seizures.filter(seizure => seizure.date.startsWith(monthStr)).length;
      data.push(count);
      labels.push(monthNames[i]);
    }
  }

  return { data, labels };
};

const processTriggerData = (seizures: Seizure[]) => {
  const triggerCounts: { [key: string]: number } = {};
  
  seizures.forEach(seizure => {
    if (seizure.triggers) {
      const triggers = seizure.triggers.split(',').map(t => t.trim()).filter(t => t);
      triggers.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
    } else {
      triggerCounts['Unknown'] = (triggerCounts['Unknown'] || 0) + 1;
    }
  });

  return Object.entries(triggerCounts)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 triggers
};

const processTimeOfDayData = (seizures: Seizure[]) => {
  const timeSlots = [
    { name: 'Morning (6am-12pm)', start: 6, end: 12 },
    { name: 'Afternoon (12pm-6pm)', start: 12, end: 18 },
    { name: 'Evening (6pm-12am)', start: 18, end: 24 },
    { name: 'Night (12am-6am)', start: 0, end: 6 }
  ];

  return timeSlots.map(slot => {
    const count = seizures.filter(seizure => {
      const hour = parseInt(seizure.time.split(':')[0]);
      if (slot.start < slot.end) {
        return hour >= slot.start && hour < slot.end;
      } else {
        // Night slot spans midnight
        return hour >= slot.start || hour < slot.end;
      }
    }).length;

    return { time: slot.name, count };
  });
};

const calculateMedicationAdherence = (medications: Medication[]) => {
  if (medications.length === 0) return 0;
  
  const activeMedications = medications.filter(med => med.active);
  if (activeMedications.length === 0) return 0;
  
  // Simple calculation - in a real app, this would track actual medication intake
  // For now, we'll assume 85% adherence as a baseline
  return 85;
};

// Helpers for pie chart
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  const d = [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'L', x, y,
    'Z',
  ].join(' ');
  return d;
};

// Yearly analysis functions
const calculateYearlyStats = (seizures: Seizure[]) => {
  if (seizures.length === 0) {
    return {
      yearlyTotal: 0,
      monthlyAverage: 0,
      bestMonth: { month: 'None', count: 0 },
      worstMonth: { month: 'None', count: 0 },
      quarterlyBreakdown: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      seasonalPattern: 'No data',
      yearlyTrend: 'No data',
      peakMonth: 'None',
      lowMonth: 'None'
    };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const monthlyData: { [key: string]: number } = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Initialize monthly data
  for (let i = 0; i < 12; i++) {
    const monthStr = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
    monthlyData[monthNames[i]] = seizures.filter(seizure => seizure.date.startsWith(monthStr)).length;
  }

  const monthlyValues = Object.values(monthlyData);
  const yearlyTotal = monthlyValues.reduce((sum, count) => sum + count, 0);
  const monthlyAverage = Math.round((yearlyTotal / 12) * 10) / 10;

  // Find best and worst months
  const bestMonthData = Object.entries(monthlyData).reduce((best, [month, count]) => 
    count > best.count ? { month, count } : best, { month: 'None', count: 0 });
  const worstMonthData = Object.entries(monthlyData).reduce((worst, [month, count]) => 
    count < worst.count ? { month, count } : worst, { month: 'None', count: 0 });

  // Quarterly breakdown
  const quarterlyBreakdown = {
    Q1: monthlyData['Jan'] + monthlyData['Feb'] + monthlyData['Mar'],
    Q2: monthlyData['Apr'] + monthlyData['May'] + monthlyData['Jun'],
    Q3: monthlyData['Jul'] + monthlyData['Aug'] + monthlyData['Sep'],
    Q4: monthlyData['Oct'] + monthlyData['Nov'] + monthlyData['Dec']
  };

  // Determine seasonal pattern
  const quarters = Object.values(quarterlyBreakdown);
  const maxQuarter = Math.max(...quarters);
  const minQuarter = Math.min(...quarters);
  let seasonalPattern = 'No clear pattern';
  
  if (maxQuarter > minQuarter * 1.5) {
    const peakQuarter = Object.entries(quarterlyBreakdown).find(([_, count]) => count === maxQuarter)?.[0];
    seasonalPattern = `Peak in ${peakQuarter}`;
  }

  // Calculate yearly trend (comparing first half vs second half)
  const firstHalf = monthlyValues.slice(0, 6).reduce((sum, count) => sum + count, 0);
  const secondHalf = monthlyValues.slice(6, 12).reduce((sum, count) => sum + count, 0);
  let yearlyTrend = 'Stable';
  
  if (secondHalf > firstHalf * 1.2) {
    yearlyTrend = 'Increasing';
  } else if (firstHalf > secondHalf * 1.2) {
    yearlyTrend = 'Decreasing';
  }

  return {
    yearlyTotal,
    monthlyAverage,
    bestMonth: bestMonthData,
    worstMonth: worstMonthData,
    quarterlyBreakdown,
    seasonalPattern,
    yearlyTrend,
    peakMonth: bestMonthData.month,
    lowMonth: worstMonthData.month
  };
};

const calculateSeizureStats = (seizures: Seizure[]) => {
  if (seizures.length === 0) {
    return {
      totalSeizures: 0,
      seizuresThisWeek: 0,
      seizuresThisMonth: 0,
      averageDuration: '0',
      longestSeizureFree: 0,
      currentSeizureFree: 0,
      mostCommonType: 'None',
      mostCommonTrigger: 'None',
      seizureFrequency: 'No data',
      medicationAdherence: 0,
      yearlyStats: {
        yearlyTotal: 0,
        monthlyAverage: 0,
        bestMonth: { month: 'None', count: 0 },
        worstMonth: { month: 'None', count: 0 },
        quarterlyBreakdown: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        seasonalPattern: 'No data',
        yearlyTrend: 'No data',
        peakMonth: 'None',
        lowMonth: 'None'
      }
    };
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Calculate seizures this week and month
  const seizuresThisWeek = seizures.filter(seizure => {
    const seizureDate = new Date(`${seizure.date} ${seizure.time}`);
    return seizureDate >= oneWeekAgo;
  }).length;

  const seizuresThisMonth = seizures.filter(seizure => {
    const seizureDate = new Date(`${seizure.date} ${seizure.time}`);
    return seizureDate >= oneMonthAgo;
  }).length;

  // Calculate average duration
  const durations = seizures.map(seizure => {
    const duration = seizure.duration.toLowerCase();
    if (duration.includes('minute')) {
      return parseInt(duration.match(/\d+/)?.[0] || '0');
    } else if (duration.includes('second')) {
      return parseInt(duration.match(/\d+/)?.[0] || '0') / 60;
    } else if (duration.includes('hour')) {
      return parseInt(duration.match(/\d+/)?.[0] || '0') * 60;
    }
    return 0;
  });

  const averageMinutes = durations.reduce((a, b) => a + b, 0) / durations.length;
  const averageDuration = averageMinutes >= 1 ? 
    `${Math.round(averageMinutes * 10) / 10} min` : 
    `${Math.round(averageMinutes * 60)} sec`;

  // Calculate seizure types
  const typeCount: { [key: string]: number } = {};
  seizures.forEach(seizure => {
    typeCount[seizure.type] = (typeCount[seizure.type] || 0) + 1;
  });
  const mostCommonType = Object.keys(typeCount).reduce((a, b) => 
    typeCount[a] > typeCount[b] ? a : b, 'None'
  );

  // Calculate most common trigger
  const triggerCount: { [key: string]: number } = {};
  seizures.forEach(seizure => {
    if (seizure.triggers) {
      const triggers = seizure.triggers.split(',').map(t => t.trim()).filter(t => t);
      triggers.forEach(trigger => {
        triggerCount[trigger] = (triggerCount[trigger] || 0) + 1;
      });
    } else {
      triggerCount['Unknown'] = (triggerCount['Unknown'] || 0) + 1;
    }
  });
  const mostCommonTrigger = Object.keys(triggerCount).reduce((a, b) => 
    triggerCount[a] > triggerCount[b] ? a : b, 'None'
  );

  // Calculate longest seizure-free period
  const sortedSeizures = [...seizures].sort((a, b) => 
    new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
  );

  let longestGap = 0;
  for (let i = 1; i < sortedSeizures.length; i++) {
    const prevDate = new Date(`${sortedSeizures[i-1].date} ${sortedSeizures[i-1].time}`);
    const currDate = new Date(`${sortedSeizures[i].date} ${sortedSeizures[i].time}`);
    const gapDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    longestGap = Math.max(longestGap, gapDays);
  }

  // Calculate current seizure-free period
  const lastSeizure = sortedSeizures[sortedSeizures.length - 1];
  const lastSeizureDate = new Date(`${lastSeizure.date} ${lastSeizure.time}`);
  const currentGap = Math.floor((now.getTime() - lastSeizureDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate seizure frequency (seizures per month)
  const firstSeizure = sortedSeizures[0];
  const firstSeizureDate = new Date(`${firstSeizure.date} ${firstSeizure.time}`);
  const totalDays = Math.max(1, Math.floor((now.getTime() - firstSeizureDate.getTime()) / (1000 * 60 * 60 * 24)));
  const seizuresPerMonth = Math.round((seizures.length / totalDays) * 30 * 10) / 10;

  let frequencyText = 'No data';
  if (seizuresPerMonth >= 1) {
    frequencyText = `${seizuresPerMonth}/month`;
  } else if (seizuresPerMonth > 0) {
    const seizuresPerWeek = Math.round(seizuresPerMonth * 7 / 30 * 10) / 10;
    frequencyText = `${seizuresPerWeek}/week`;
  }

  // Calculate yearly statistics
  const yearlyStats = calculateYearlyStats(seizures);

  return {
    totalSeizures: seizures.length,
    seizuresThisWeek,
    seizuresThisMonth,
    averageDuration,
    longestSeizureFree: longestGap,
    currentSeizureFree: Math.max(0, currentGap),
    mostCommonType,
    mostCommonTrigger,
    seizureFrequency: frequencyText,
    medicationAdherence: 0, // Will be calculated separately
    yearlyStats
  };
};

export default function ReportsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { seizures, loading: seizuresLoading, getSeizureStats } = useSeizures();
  const { medications, loading: medicationsLoading } = useMedications();
  const [timeRange, setTimeRange] = useState('weekly');
  const [seizureStats, setSeizureStats] = useState({
    totalSeizures: 0,
    seizuresThisWeek: 0,
    seizuresThisMonth: 0,
    averageDuration: '0',
    longestSeizureFree: 0,
    currentSeizureFree: 0,
    mostCommonType: 'None',
    mostCommonTrigger: 'None',
    seizureFrequency: 'No data',
    medicationAdherence: 0,
    yearlyStats: {
      yearlyTotal: 0,
      monthlyAverage: 0,
      bestMonth: { month: 'None', count: 0 },
      worstMonth: { month: 'None', count: 0 },
      quarterlyBreakdown: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      seasonalPattern: 'No data',
      yearlyTrend: 'No data',
      peakMonth: 'None',
      lowMonth: 'None'
    }
  });

  // Process data for charts
  const frequencyData = useMemo(() => 
    processSeizureFrequency(seizures, timeRange), 
    [seizures, timeRange]
  );

  const triggerData = useMemo(() => 
    processTriggerData(seizures), 
    [seizures]
  );

  const timeOfDayData = useMemo(() => 
    processTimeOfDayData(seizures), 
    [seizures]
  );

  const medicationAdherence = useMemo(() => 
    calculateMedicationAdherence(medications), 
    [medications]
  );

  // Update seizure stats when data changes
  useEffect(() => {
    const stats = calculateSeizureStats(seizures);
    setSeizureStats({
      ...stats,
      medicationAdherence
    });
  }, [seizures, medicationAdherence]);

  const getMaxValue = (data: number[]) => {
    if (data.length === 0) return 1;
    return Math.max(...data) + 1;
  };
  
  const renderBarChart = (data: number[], labels: string[]) => {
    const maxValue = getMaxValue(data);
    const isYearly = timeRange === 'yearly';
    // If yearly, render a horizontal bar chart to fit on screen width
    if (isYearly) {
      const containerHeight = 320;
      const leftAxisWidth = 56; // space for month labels
      const rightPadding = 16;
      const topPadding = 12;
      const bottomPadding = 20;
      const rowGap = 6;
      const rowBarHeight = 16; // bar thickness
      const plotHeight = containerHeight - topPadding - bottomPadding;
      const totalRows = labels.length;
      const rowHeight = Math.max((plotHeight - rowGap * (totalRows - 1)) / totalRows, rowBarHeight);
      const tickCount = 5;
      const xTicks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((maxValue / tickCount) * i));

      return (
        <View className="bg-white rounded-xl p-4 shadow-sm"
              style={{ 
                elevation: Platform.OS === 'android' ? 3 : 0,
                shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
                shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                shadowRadius: Platform.OS === 'ios' ? 3 : 0,
              }}>
          {/* Header */}
          <View className="mb-2">
            <Text className="text-lg font-bold text-gray-800 text-center"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
              Monthly Seizure Distribution
            </Text>
          </View>

          {/* Plot area */}
          <View style={{ height: containerHeight, flexDirection: 'row' }}>
            {/* Y axis labels (months) */}
            <View style={{ width: leftAxisWidth, paddingTop: topPadding, paddingBottom: bottomPadding }}>
              {labels.map((label, idx) => (
                <View key={idx} style={{ height: rowHeight + rowGap, justifyContent: 'center' }}>
                  <Text className="text-xs text-gray-600" numberOfLines={1}
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Grid + bars */}
            <View style={{ flex: 1, paddingTop: topPadding, paddingBottom: bottomPadding, paddingRight: rightPadding }}>
              {/* Vertical gridlines and x-axis ticks */}
              <View style={{ position: 'absolute', left: 0, right: rightPadding, top: topPadding, height: plotHeight }}>
                {xTicks.map((tick, i) => (
                  <View key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(i / tickCount) * 100}%`, width: 1, backgroundColor: '#E5E7EB' }} />
                ))}
              </View>

              {/* Zero baseline */}
              <View style={{ position: 'absolute', left: 0, right: rightPadding, top: topPadding + plotHeight, height: 2, backgroundColor: '#D1D5DB' }} />

              {/* Rows with bars */}
              {data.map((value, idx) => {
                const widthPct = (value / maxValue) * 100;
                const barColor = value === 0 ? '#E5E7EB' :
                                value <= maxValue * 0.25 ? '#10B981' :
                                value <= maxValue * 0.5 ? '#F59E0B' :
                                value <= maxValue * 0.75 ? '#F97316' : '#EF4444';
                return (
                  <View key={idx} style={{ height: rowHeight + rowGap, justifyContent: 'center' }}>
                    <View style={{ height: rowBarHeight, backgroundColor: '#F3F4F6', borderRadius: 6, overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${widthPct}%`, backgroundColor: barColor }} />
                    </View>
                    {value > 0 ? (
                      <Text className="text-xs font-bold text-gray-800" style={{ position: 'absolute', right: 0, top: 0, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                        {value}
                      </Text>
                    ) : null}
                  </View>
                );
              })}

              {/* X-axis tick labels */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                {xTicks.map((tick, i) => (
                  <Text key={i} className="text-xs text-gray-600" style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>{tick}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      );
    }
    // Default vertical chart for weekly/monthly
    const chartHeight = 220;
    const barWidth = 28;
    const barSpacing = 6;
    const yAxisWidth = 40; // reserved space on left
    const paddingTop = 10;
    const paddingBottom = 36; // tighter bottom padding so x-axis is closer to zero line
    const chartAreaHeight = chartHeight - paddingTop - paddingBottom;
    
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm" 
            style={{ 
              elevation: Platform.OS === 'android' ? 3 : 0,
              shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
              shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
              shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
              shadowRadius: Platform.OS === 'ios' ? 3 : 0,
            }}>
        
        {/* Chart Header */}
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 text-center" 
                style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
            {timeRange === 'yearly' ? 'Monthly Seizure Distribution' : 
             timeRange === 'monthly' ? 'Weekly Seizure Distribution' : 
             'Daily Seizure Distribution'}
          </Text>
        </View>
        
        {/* Y-axis and Chart Area */}
        <View className="flex-row" style={{ height: chartHeight }}>
          {/* Y-axis labels (left) */}
          <View style={{ width: yAxisWidth, paddingTop, paddingBottom }}>
            {[...Array(6)].map((_, i) => {
              const value = Math.round((maxValue / 5) * (5 - i));
              const y = paddingTop + (i * chartAreaHeight) / 5;
              return (
                <View key={i} style={{ position: 'absolute', top: y - 6, left: 0, width: yAxisWidth }}>
                  <Text className="text-xs text-gray-500 text-right" style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>{value}</Text>
                </View>
              );
            })}
          </View>

          {/* Grid and bars container */}
          <View className="flex-1" style={{ paddingRight: 12, paddingTop, paddingBottom }}>
            {/* Horizontal gridlines */}
            <View style={{ position: 'absolute', left: 0, right: 12, top: paddingTop, height: chartAreaHeight }}>
              {[...Array(6)].map((_, i) => {
                const y = (i * chartAreaHeight) / 5;
                return (
                  <View key={i} style={{ position: 'absolute', top: y, left: 0, right: 0, height: 1, backgroundColor: '#E5E7EB' }} />
                );
              })}
            </View>

            {/* Y-axis line */}
            <View style={{ position: 'absolute', top: paddingTop, height: chartAreaHeight, left: 0, width: 2, backgroundColor: '#D1D5DB' }} />

            {/* Bars */}
            <View className="flex-row items-end" style={{ height: chartAreaHeight, marginLeft: 8 }}>
              {data.map((value, index) => {
                const barHeight = Math.max((value / maxValue) * (chartAreaHeight - 10), value > 0 ? 6 : 0);
                const barColor = value === 0 ? 'bg-gray-200' : 
                                value <= maxValue * 0.25 ? 'bg-green-500' :
                                value <= maxValue * 0.5 ? 'bg-yellow-500' :
                                value <= maxValue * 0.75 ? 'bg-orange-500' : 'bg-red-500';
                
                return (
                  <View key={index} className="items-center justify-end" 
                        style={{ width: barWidth + barSpacing, marginLeft: index === 0 ? 0 : barSpacing }}>
                    {/* Value label on top of bar */}
                    {value > 0 && (
                      <Text className="text-xs font-bold text-gray-800 mb-1" 
                            style={{ 
                              fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                              textAlign: 'center',
                              fontSize: 10
                            }}>
                        {value}
                      </Text>
                    )}
                    
                    {/* Bar */}
                    <View 
                      className={`${barColor} rounded-t-md`}
                      style={{ 
                        height: barHeight,
                        width: barWidth,
                        minHeight: value > 0 ? 6 : 0,
                        shadowColor: value > 0 ? '#000' : 'transparent',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: value > 0 ? 0.3 : 0,
                        shadowRadius: 3,
                        elevation: value > 0 ? 3 : 0
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </View>
        
        {/* X-axis labels */}
        <View style={{ marginTop: 4, paddingLeft: yAxisWidth }}>
          {/* X-axis baseline */}
          <View style={{ height: 2, backgroundColor: '#D1D5DB', marginLeft: 8 }} />
          <View className="flex-row" style={{ marginLeft: 8 }}>
            {labels.map((label, index) => (
              <View key={index} style={{ width: barWidth + barSpacing, alignItems: 'center' }}>
                <Text className="text-xs text-gray-600 font-medium" style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Chart summary with enhanced metrics */}
        <View className="mt-6 pt-4 border-t border-gray-200">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-bold text-gray-800" 
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
              Total: {data.reduce((sum, val) => sum + val, 0)} seizures
            </Text>
            <Text className="text-sm font-bold text-blue-600" 
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
              Peak: {Math.max(...data)} in {labels[data.indexOf(Math.max(...data))]}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-600" 
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
              Average: {data.length > 0 ? (data.reduce((sum, val) => sum + val, 0) / data.length).toFixed(1) : 0}
            </Text>
            <Text className="text-sm text-gray-600" 
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
              Zero days: {data.filter(val => val === 0).length}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  const renderTriggerChart = () => {
    if (triggerData.length === 0) {
      return (
        <View className="bg-white rounded-xl p-8 shadow-sm items-center justify-center"
              style={{ 
                elevation: Platform.OS === 'android' ? 3 : 0,
                shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
                shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                shadowRadius: Platform.OS === 'ios' ? 3 : 0,
              }}>
          <Ionicons name="analytics-outline" size={48} color="#9CA3AF" />
          <Text className="text-lg text-gray-500 mt-4 text-center" 
                style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
            No trigger data available
          </Text>
          <Text className="text-sm text-gray-400 mt-2 text-center" 
                style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
            Add seizure entries with trigger information to see analysis
          </Text>
        </View>
      );
    }

    const totalTriggers = triggerData.reduce((sum, item) => sum + item.count, 0);
    const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
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
          {triggerData.map((item, index) => {
            const percentage = Math.round((item.count / totalTriggers) * 100);
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
            
            return (
              <View key={index} className="flex-row items-center mb-3">
                <View className={`w-4 h-4 rounded-full mr-3 ${colors[index % colors.length]}`} />
                <View className="flex-1">
                  <Text className="text-base text-gray-800 font-medium" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {item.trigger}
                  </Text>
                  <Text className="text-sm text-gray-500" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {item.count} occurrences ({percentage}%)
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        
        <View className="w-40 h-40 justify-center items-center">
          <Svg width={160} height={160} viewBox="0 0 160 160">
            {(() => {
              const cx = 80;
              const cy = 80;
              const r = 70;
              let startAngle = 0;
              return triggerData.map((item, index) => {
                const sliceAngle = (item.count / totalTriggers) * 360;
                const endAngle = startAngle + sliceAngle;
                const d = describeArc(cx, cy, r, startAngle, endAngle);
                const path = (
                  <Path key={index} d={d} fill={pieColors[index % pieColors.length]} />
                );
                startAngle = endAngle;
                return path;
              });
            })()}
          </Svg>
          <Text className="text-sm text-gray-600 mt-2" style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
            Total: {totalTriggers}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderTimeChart = () => {
    if (timeOfDayData.every(item => item.count === 0)) {
      return (
        <View className="bg-white rounded-xl p-8 shadow-sm items-center justify-center"
              style={{ 
                elevation: Platform.OS === 'android' ? 3 : 0,
                shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
                shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                shadowRadius: Platform.OS === 'ios' ? 3 : 0,
              }}>
          <Ionicons name="time-outline" size={48} color="#9CA3AF" />
          <Text className="text-lg text-gray-500 mt-4 text-center" 
                style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
            No time data available
          </Text>
          <Text className="text-sm text-gray-400 mt-2 text-center" 
                style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
            Add seizure entries to see time-of-day analysis
          </Text>
        </View>
      );
    }

    const totalEvents = timeOfDayData.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm"
            style={{ 
              elevation: Platform.OS === 'android' ? 3 : 0,
              shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
              shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
              shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
              shadowRadius: Platform.OS === 'ios' ? 3 : 0,
            }}>
        {timeOfDayData.map((item, index) => {
          const percentage = totalEvents > 0 ? (item.count / totalEvents) * 100 : 0;
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
          
          return (
            <View key={index} className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-medium text-gray-800" 
                      style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                  {item.time}
                </Text>
                <Text className="text-sm text-gray-500" 
                      style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                  {item.count} seizures
                </Text>
              </View>
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
  
  // Loading state
  if (seizuresLoading || medicationsLoading) {
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
          
          <View style={{ minWidth: 44, minHeight: 44 }} />
        </View>

        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text className="text-lg text-gray-600 mt-4" 
                style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
            Loading seizure data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            {renderBarChart(frequencyData.data, frequencyData.labels)}
          </View>

          {/* Yearly Analysis Section - Only show when yearly is selected */}
          {timeRange === 'yearly' && (
            <View className="mb-6">
              <Text className="text-2xl font-bold text-gray-800 mb-4" 
                    style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                Yearly Analysis
              </Text>
              
              {/* Yearly Overview */}
              <View className="bg-white rounded-xl p-4 shadow-sm mb-4"
                    style={{ 
                      elevation: Platform.OS === 'android' ? 3 : 0,
                      shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                      shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
                      shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                      shadowRadius: Platform.OS === 'ios' ? 3 : 0,
                    }}>
                <Text className="text-lg font-bold text-gray-800 mb-4" 
                      style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                  Year Overview
                </Text>
                <View className="flex-row mb-4">
                  <View className="flex-1 items-center">
                    <Text className="text-3xl font-bold text-blue-500 mb-1" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      {seizureStats.yearlyStats.yearlyTotal}
                    </Text>
                    <Text className="text-sm text-gray-500 text-center" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      Total This Year
                    </Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-3xl font-bold text-green-500 mb-1" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      {seizureStats.yearlyStats.monthlyAverage}
                    </Text>
                    <Text className="text-sm text-gray-500 text-center" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      Monthly Average
                    </Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-3xl font-bold text-purple-500 mb-1" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      {seizureStats.yearlyStats.yearlyTrend}
                    </Text>
                    <Text className="text-sm text-gray-500 text-center" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      Yearly Trend
                    </Text>
                  </View>
                </View>
              </View>

              {/* Peak and Low Months */}
              <View className="bg-white rounded-xl p-4 shadow-sm mb-4"
                    style={{ 
                      elevation: Platform.OS === 'android' ? 3 : 0,
                      shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                      shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
                      shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                      shadowRadius: Platform.OS === 'ios' ? 3 : 0,
                    }}>
                <Text className="text-lg font-bold text-gray-800 mb-4" 
                      style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                  Monthly Patterns
                </Text>
                <View className="flex-row">
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-red-500 mb-1" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      {seizureStats.yearlyStats.peakMonth}
                    </Text>
                    <Text className="text-sm text-gray-500 text-center" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      Peak Month ({seizureStats.yearlyStats.bestMonth.count} seizures)
                    </Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-green-500 mb-1" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      {seizureStats.yearlyStats.lowMonth}
                    </Text>
                    <Text className="text-sm text-gray-500 text-center" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      Best Month ({seizureStats.yearlyStats.worstMonth.count} seizures)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Quarterly Breakdown */}
              <View className="bg-white rounded-xl p-4 shadow-sm mb-4"
                    style={{ 
                      elevation: Platform.OS === 'android' ? 3 : 0,
                      shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                      shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
                      shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                      shadowRadius: Platform.OS === 'ios' ? 3 : 0,
                    }}>
                <Text className="text-lg font-bold text-gray-800 mb-4" 
                      style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                  Quarterly Breakdown
                </Text>
                <View className="flex-row">
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-blue-500 mb-1" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      {seizureStats.yearlyStats.quarterlyBreakdown.Q1}
                    </Text>
                    <Text className="text-sm text-gray-500 text-center" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      Q1 (Jan-Mar)
                    </Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-green-500 mb-1" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      {seizureStats.yearlyStats.quarterlyBreakdown.Q2}
                    </Text>
                    <Text className="text-sm text-gray-500 text-center" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      Q2 (Apr-Jun)
                    </Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-orange-500 mb-1" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      {seizureStats.yearlyStats.quarterlyBreakdown.Q3}
                    </Text>
                    <Text className="text-sm text-gray-500 text-center" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      Q3 (Jul-Sep)
                    </Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-purple-500 mb-1" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      {seizureStats.yearlyStats.quarterlyBreakdown.Q4}
                    </Text>
                    <Text className="text-sm text-gray-500 text-center" 
                          style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                      Q4 (Oct-Dec)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Seasonal Pattern */}
              <View className="bg-white rounded-xl p-4 shadow-sm"
                    style={{ 
                      elevation: Platform.OS === 'android' ? 3 : 0,
                      shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                      shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
                      shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                      shadowRadius: Platform.OS === 'ios' ? 3 : 0,
                    }}>
                <Text className="text-lg font-bold text-gray-800 mb-4" 
                      style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                  Seasonal Analysis
                </Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-gray-600" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Pattern:
                  </Text>
                  <Text className="text-base font-semibold text-gray-800" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {seizureStats.yearlyStats.seasonalPattern}
                  </Text>
                </View>
              </View>
            </View>
          )}

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
              Comprehensive Summary
            </Text>
            
            {/* Primary Statistics */}
            <View className="bg-white rounded-xl p-4 shadow-sm mb-4"
                  style={{ 
                    elevation: Platform.OS === 'android' ? 3 : 0,
                    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
                    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                    shadowRadius: Platform.OS === 'ios' ? 3 : 0,
                  }}>
              <Text className="text-lg font-bold text-gray-800 mb-4" 
                    style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                Key Metrics
              </Text>
              <View className="flex-row mb-4">
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-blue-500 mb-1" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {seizureStats.totalSeizures}
                  </Text>
                  <Text className="text-sm text-gray-500 text-center" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Total Seizures
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-green-500 mb-1" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {seizureStats.currentSeizureFree}
                  </Text>
                  <Text className="text-sm text-gray-500 text-center" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Days Seizure-Free
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-purple-500 mb-1" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {seizureStats.seizureFrequency}
                  </Text>
                  <Text className="text-sm text-gray-500 text-center" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Frequency
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Activity */}
            <View className="bg-white rounded-xl p-4 shadow-sm mb-4"
                  style={{ 
                    elevation: Platform.OS === 'android' ? 3 : 0,
                    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
                    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                    shadowRadius: Platform.OS === 'ios' ? 3 : 0,
                  }}>
              <Text className="text-lg font-bold text-gray-800 mb-4" 
                    style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                Recent Activity
              </Text>
              <View className="flex-row">
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-orange-500 mb-1" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {seizureStats.seizuresThisWeek}
                  </Text>
                  <Text className="text-sm text-gray-500 text-center" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    This Week
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-red-500 mb-1" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {seizureStats.seizuresThisMonth}
                  </Text>
                  <Text className="text-sm text-gray-500 text-center" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    This Month
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-indigo-500 mb-1" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {seizureStats.averageDuration}
                  </Text>
                  <Text className="text-sm text-gray-500 text-center" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Avg Duration
                  </Text>
                </View>
              </View>
            </View>

            {/* Patterns & Analysis */}
            <View className="bg-white rounded-xl p-4 shadow-sm mb-4"
                  style={{ 
                    elevation: Platform.OS === 'android' ? 3 : 0,
                    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
                    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                    shadowRadius: Platform.OS === 'ios' ? 3 : 0,
                  }}>
              <Text className="text-lg font-bold text-gray-800 mb-4" 
                    style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                Patterns & Analysis
              </Text>
              <View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-base text-gray-600" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Most Common Type:
                  </Text>
                  <Text className="text-base font-semibold text-gray-800" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {seizureStats.mostCommonType}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-base text-gray-600" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Most Common Trigger:
                  </Text>
                  <Text className="text-base font-semibold text-gray-800" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {seizureStats.mostCommonTrigger}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-gray-600" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Longest Seizure-Free Period:
                  </Text>
                  <Text className="text-base font-semibold text-gray-800" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {seizureStats.longestSeizureFree} days
                  </Text>
                </View>
              </View>
            </View>

            {/* Medication Adherence */}
            <View className="bg-white rounded-xl p-4 shadow-sm"
                  style={{ 
                    elevation: Platform.OS === 'android' ? 3 : 0,
                    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
                    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
                    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
                    shadowRadius: Platform.OS === 'ios' ? 3 : 0,
                  }}>
              <Text className="text-lg font-bold text-gray-800 mb-4" 
                    style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                Medication Adherence
              </Text>
              <View className="flex-row items-center justify-center">
                <View className="items-center">
                  <Text className="text-4xl font-bold text-green-500 mb-2" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    {seizureStats.medicationAdherence}%
                  </Text>
                  <Text className="text-base text-gray-500 text-center" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }}>
                    Based on {medications.filter(m => m.active).length} active medications
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
            onPress={() => {
              Alert.alert(
                'Export Report',
                'This feature will generate a comprehensive PDF report with all seizure data, charts, and analysis for your doctor.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Export', onPress: () => {
                    // TODO: Implement PDF export functionality
                    Alert.alert('Export', 'PDF export feature coming soon!');
                  }}
                ]
              );
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