# Emergency System Debug Instructions

## 🔍 **Current Status**
- Mobile app shows: "✅ Doctor notification sent successfully"
- But also shows: "Error notifying doctors: Missing or insufficient permissions"
- Doctor portal: Not showing any alerts

This suggests **multiple issues** happening simultaneously.

## 🧪 **Debug Steps**

### **Step 1: Deploy Rules (Critical)**
```bash
firebase deploy --only firestore:rules
```
**This is essential** - the rules changes won't take effect until deployed!

### **Step 2: Check Doctor Portal Console**
1. Open doctor portal in browser
2. Go to "Emergency Alerts" tab
3. Open browser console (F12)
4. Look for these logs:
   - ✅ "Connected patient IDs: [...]"
   - ✅ "All alerts found: X"
   - ✅ "Raw alert data: {...}"
   - ❌ "Error listening to emergency alerts: ..."

### **Step 3: Check Firebase Console**
1. Go to Firebase Console → Firestore Database
2. Check these collections:
   - `emergencyAlerts` - Should have documents
   - `emergencyNotifications` - May or may not have documents
3. Note the document IDs and data

### **Step 4: Test Mobile App Again**
1. Send another emergency alert
2. Check console logs for:
   - ✅ "Emergency alert created successfully"
   - ✅ "Sent urgent medical notification"
   - ✅ "Doctor notification sent successfully"
   - ❌ Any permission errors

## 🔧 **Temporary Debug Mode**

I've modified the doctor portal to show **ALL emergency alerts** (not just connected patients) for debugging. This will help us see if:
1. Alerts are being created at all
2. Doctor portal can read the alerts collection
3. The filtering logic is working

## 🎯 **Expected Debug Output**

### **Doctor Portal Console (After Rules Deployment):**
```javascript
Connected patient IDs: ["patient123", "patient456"]
All alerts found: 3
Raw alert data: {userId: "patient123", userName: "John Doe", ...}
Raw alert data: {userId: "patient789", userName: "Jane Smith", ...}
All alerts details: [{id: "alert1", userId: "patient123", ...}]
Showing alerts: 3
```

### **Mobile App Console:**
```javascript
Emergency alert created successfully
Location: 123 Main St, City, State
Sent urgent medical notification: notification-id-123
Doctor notification sent successfully
```

## 🚨 **If Still Not Working**

### **Check 1: Rules Deployment**
```bash
# Verify rules are deployed
firebase firestore:rules:get
```

### **Check 2: Authentication**
In doctor portal console:
```javascript
// Check if doctor is authenticated
console.log('Current user:', auth.currentUser);
console.log('Doctor ID:', user?.uid);
```

### **Check 3: Manual Firestore Query**
In doctor portal console:
```javascript
// Test direct Firestore access
import { collection, getDocs } from 'firebase/firestore';
const snapshot = await getDocs(collection(db, 'emergencyAlerts'));
console.log('Manual query result:', snapshot.docs.length);
```

## 🎊 **Success Indicators**

### **✅ Working Correctly:**
- Mobile: Emergency alert success + location shared
- Doctor Portal: Shows emergency alerts with location data
- Console: No permission errors
- Firebase: Documents in both collections

### **⚠️ Partial Success:**
- Mobile: Emergency alert success (even with some permission errors)
- Doctor Portal: Shows alerts (even if notifications fail)
- Firebase: At least `emergencyAlerts` collection has data

### **❌ Still Broken:**
- Mobile: Emergency alert fails completely
- Doctor Portal: No alerts shown + permission errors in console
- Firebase: No documents created

## 🚀 **Next Actions**

1. **Deploy rules first** (most critical)
2. **Test doctor portal** - check console logs
3. **Test mobile app** - send new alert
4. **Report results** - what you see in console logs

The debug mode will show us exactly what's happening! 🔍
