# 🔧 Configuration & Testing Guide

## 📋 Pre-Deployment Checklist

### ✅ **Step 1: Configure GPS Coordinates**

Edit `src/services/attendance.ts` (lines 21-25):

```typescript
const DEFAULT_OFFICE_LOCATION: GeofenceConfig = {
  latitude: 13.0827,  // Replace with your office latitude
  longitude: 80.2707, // Replace with your office longitude  
  radius: 500 // Radius in meters (500m = 0.31 miles)
}
```

**How to get coordinates:**
1. Open Google Maps
2. Right-click on your office location
3. Click on the coordinates (e.g., "13.0827, 80.2707")
4. Copy and paste into the code above

---

### ✅ **Step 2: Setup Supabase Storage**

1. **Create Storage Bucket:**
   ```sql
   -- Go to Supabase Dashboard → Storage → Create Bucket
   -- Bucket name: employee-files
   -- Public: Yes (for avatars)
   ```

2. **Set Bucket Policies:**
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Allow authenticated uploads" ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'employee-files');

   -- Allow public read access
   CREATE POLICY "Allow public read" ON storage.objects
   FOR SELECT TO public
   USING (bucket_id = 'employee-files');
   
   -- Allow users to update their own files
   CREATE POLICY "Allow users to update own files" ON storage.objects
   FOR UPDATE TO authenticated
   USING (bucket_id = 'employee-files');
   ```

3. **Configure CORS (if needed):**
   - Go to Storage Settings
   - Add your domain to allowed origins
   - Default: `*` (allows all)

---

### ✅ **Step 3: Verify Database Tables**

Run this query in Supabase SQL Editor to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'employees',
  'users_metadata',
  'attendance',
  'leave_requests',
  'performance_reviews',
  'tasks',
  'support_tickets',
  'announcements',
  'courses'
)
ORDER BY table_name;
```

**Expected output:** 9 tables

---

### ✅ **Step 4: Test Theme System**

1. **Start Dev Server:**
   ```bash
   pnpm run dev
   ```

2. **Test Each Theme:**
   - Click theme toggle button in top navigation
   - Test all 4 themes: Light, Dark, Neon, Midnight
   - Reload page - theme should persist
   - Try system preference detection

3. **Verify Animations:**
   - Page transitions should be smooth
   - Hover effects should work
   - No flickering or jumps

---

### ✅ **Step 5: Test GPS Attendance**

#### **Desktop Testing:**

1. **Allow Location:**
   - Browser will ask for location permission
   - Click "Allow" when prompted
   - Check browser settings if denied

2. **Clock In Test:**
   ```
   ✓ Login as employee
   ✓ Navigate to Employee Home
   ✓ Click "Clock In" button
   ✓ Verify GPS verification message
   ✓ Check attendance record created
   ✓ Verify location stored
   ```

3. **Clock Out Test:**
   ```
   ✓ Click "Clock Out" button
   ✓ Verify work hours calculated
   ✓ Check completion message
   ✓ Verify can't clock in again today
   ```

#### **Mobile Testing:**

1. **Enable GPS:**
   - Settings → Location → On
   - Allow browser location access

2. **Test Scenarios:**
   - Inside office (within 500m)
   - Outside office (should fail)
   - Poor GPS signal
   - Airplane mode

3. **Expected Behavior:**
   - Fast clock in/out (< 3 seconds)
   - Clear error messages
   - Location accuracy indicator

---

### ✅ **Step 6: Test Analytics Dashboard**

1. **Access Dashboard:**
   ```
   Admin Dashboard → Reports/Analytics
   ```

2. **Verify Charts Load:**
   - ✅ Attendance Trends (Area chart)
   - ✅ Department Performance (Bar chart)
   - ✅ Department Distribution (Pie chart)
   - ✅ Detailed Metrics Table

3. **Test Filters:**
   - Change date range (7/30/90/365 days)
   - Verify data updates
   - Check loading states

4. **Test Export:**
   - Click "Export" button
   - Verify CSV downloads
   - Open in Excel/Sheets
   - Check data accuracy

---

### ✅ **Step 7: Test Employee Profile**

1. **Navigate to Profile:**
   ```
   Employee → My Profile
   ```

2. **Test Avatar Upload:**
   - Click camera icon
   - Select image (< 5MB)
   - Verify upload success
   - Check image displays

3. **Test Profile Edit:**
   - Click "Edit Profile"
   - Update personal info
   - Add emergency contact
   - Click "Save Changes"
   - Verify data persists

---

## 🐛 Common Issues & Fixes

### **Issue 1: GPS Not Working**

**Symptoms:**
- "Location access denied" error
- Clock in fails immediately

**Solutions:**
1. **Browser Permissions:**
   ```
   Chrome: Settings → Privacy → Site Settings → Location
   Firefox: Settings → Privacy → Permissions → Location
   Safari: Settings → Websites → Location Services
   ```

2. **HTTPS Required:**
   - GPS only works on HTTPS or localhost
   - Deploy with SSL certificate

3. **Fallback Option:**
   ```typescript
   // In attendance.ts, enable remote work:
   await clockIn(employeeId, true) // allows remote clock-in
   ```

---

### **Issue 2: Charts Not Loading**

**Symptoms:**
- Blank analytics dashboard
- Console errors about Recharts

**Solutions:**
1. **Verify Recharts Installed:**
   ```bash
   pnpm list recharts
   # Should show: recharts x.x.x
   ```

2. **Reinstall if Missing:**
   ```bash
   pnpm add recharts
   ```

3. **Check Data:**
   - Verify attendance records exist
   - Check Supabase connection
   - Look for console errors

---

### **Issue 3: Avatar Upload Fails**

**Symptoms:**
- "Failed to upload avatar" error
- Image doesn't display

**Solutions:**
1. **Check Storage Bucket:**
   ```sql
   -- Verify bucket exists
   SELECT * FROM storage.buckets WHERE name = 'employee-files';
   ```

2. **Check File Size:**
   - Max 5MB per file
   - Compress large images

3. **Verify Policies:**
   - Check RLS policies allow uploads
   - Test with admin account first

---

### **Issue 4: Theme Not Persisting**

**Symptoms:**
- Theme resets on page reload
- Always shows light theme

**Solutions:**
1. **Check localStorage:**
   ```javascript
   // Open browser console
   localStorage.getItem('app-theme')
   // Should return: light, dark, neon, or midnight
   ```

2. **Clear Cache:**
   ```
   Ctrl+Shift+Delete → Clear browsing data
   ```

3. **Try Incognito:**
   - Test in private/incognito mode
   - If works, clear cookies

---

### **Issue 5: Attendance Stats Wrong**

**Symptoms:**
- Incorrect work hours
- Wrong present/absent counts

**Solutions:**
1. **Check Time Zones:**
   ```sql
   -- Verify timezone settings
   SHOW timezone;
   ```

2. **Verify Attendance Records:**
   ```sql
   SELECT * FROM attendance 
   WHERE employee_id = 'YOUR_ID'
   ORDER BY date DESC 
   LIMIT 10;
   ```

3. **Recalculate Stats:**
   - Refresh analytics dashboard
   - Change date range and back
   - Check for duplicate records

---

## 🎯 Performance Optimization

### **1. Image Optimization**

```typescript
// Compress avatars before upload
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 400
        const MAX_HEIGHT = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
```

### **2. Database Indexing**

```sql
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date 
ON attendance(employee_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_date 
ON attendance(date DESC);

CREATE INDEX IF NOT EXISTS idx_employees_department 
ON employees(department);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to 
ON tasks(assigned_to, status);
```

### **3. Lazy Loading**

```typescript
// In EmployeeHome.tsx
import { lazy, Suspense } from 'react'

const AttendanceWidget = lazy(() => import('@/components/attendance/AttendanceWidget'))

// In component:
<Suspense fallback={<LoadingSpinner />}>
  <AttendanceWidget />
</Suspense>
```

---

## 🔐 Security Checklist

- [ ] Change default Supabase keys
- [ ] Enable RLS on all tables
- [ ] Verify admin/employee roles work
- [ ] Test password strength validator
- [ ] Check force password change on first login
- [ ] Verify GPS location is stored securely
- [ ] Test file upload restrictions
- [ ] Enable audit logging (Phase 8)
- [ ] Set up backup system
- [ ] Configure rate limiting

---

## 📱 Mobile Optimization

### **Progressive Web App (PWA)**

Create `public/manifest.json`:

```json
{
  "name": "Employee Management System",
  "short_name": "EMS",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **Service Worker (Optional)**

For offline capability:

```javascript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles/globals.css'
      ])
    })
  )
})
```

---

## 🚀 Deployment Guide

### **Option 1: Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### **Option 2: Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify Dashboard
```

### **Option 3: Self-Hosted**

```bash
# Build production bundle
pnpm run build

# Output in dist/ folder
# Serve with Nginx/Apache
```

---

## 📊 Monitoring & Analytics

### **Track Key Metrics:**

1. **User Engagement:**
   - Daily active users
   - Attendance completion rate
   - Average session duration

2. **Performance:**
   - Page load time
   - GPS clock-in speed
   - Chart render time

3. **Errors:**
   - Failed clock-ins
   - Upload failures
   - API errors

### **Setup Error Tracking:**

```bash
# Install Sentry (optional)
pnpm add @sentry/react

# Configure in main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE
})
```

---

## 🎓 Training Materials

### **For Employees:**

1. **Quick Start Guide**
   - How to clock in/out
   - Changing themes
   - Updating profile

2. **Video Tutorials**
   - GPS attendance demo
   - Profile management
   - Mobile app usage

### **For Admins:**

1. **Admin Manual**
   - Inviting employees
   - Reading analytics
   - Exporting reports

2. **Technical Documentation**
   - Database schema
   - API endpoints
   - Configuration options

---

## 📞 Support & Maintenance

### **Regular Maintenance Tasks:**

- **Daily:**
  - Monitor attendance completion
  - Check for GPS errors
  - Review system logs

- **Weekly:**
  - Backup database
  - Check storage usage
  - Review analytics trends

- **Monthly:**
  - Update dependencies
  - Review performance metrics
  - Plan new features

---

## ✅ Go-Live Checklist

- [ ] GPS coordinates configured
- [ ] Supabase storage setup
- [ ] All themes tested
- [ ] GPS attendance tested (desktop + mobile)
- [ ] Analytics dashboard verified
- [ ] Profile upload working
- [ ] Database indexes created
- [ ] RLS policies verified
- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] Backup system ready
- [ ] Admin accounts created
- [ ] Employee training completed
- [ ] Documentation shared
- [ ] Monitoring setup

---

**Status:** Ready for Testing ✅  
**Last Updated:** November 5, 2025  
**Version:** 2.1.0
