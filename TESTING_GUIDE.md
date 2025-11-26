# MX.Salon - Testing Guide

## Prerequisites

1. **Backend Running**: `cd backend-node && npm run dev`
   - Should see: "MongoDB connected" and "Server listening on http://localhost:5000"
   
2. **Frontend Running**: `cd frontend-web && npm run dev`
   - Should see: "VITE ready" and URL (usually http://localhost:5173)

3. **MongoDB Atlas**: IP whitelisted and connection working

## Test Scenarios

### 1. Smooth Scrolling ✅

**Test Steps**:
1. Open any page with content longer than viewport
2. Click any anchor link or scroll manually
3. **Expected**: Smooth scroll animation (not instant jump)

**Pages to Test**:
- Landing page
- Customer salon list (if many salons)
- Vendor queue dashboard

---

### 2. Vendor Navigation & Session ✅

**Test Steps**:
1. Go to http://localhost:5173/login
2. Register as Vendor (or login with existing vendor account)
3. **Expected**: Immediately redirects to `/vendor` (no role selection screen)
4. Verify you see "Your Salon" or "Create Salon" form
5. Click browser refresh (F5)
6. **Expected**: Stays on `/vendor` page (session persists)
7. Click "Sign out" in header
8. **Expected**: Redirects to `/login`
9. Try accessing http://localhost:5173/vendor directly (without login)
10. **Expected**: Redirects to `/login`

**Success Criteria**:
- ✅ No intermediate role selection after login
- ✅ Direct redirect to vendor dashboard
- ✅ Session persists on refresh
- ✅ Logout redirects to login
- ✅ Protected route redirects without token

---

### 3. Customer Navigation & Session ✅

**Test Steps**:
1. Go to http://localhost:5173/login
2. Register as Customer (or login with existing customer account)
3. **Expected**: Redirects to `/dashboard`
4. If first-time user: **Expected**: Auto-redirects to `/onboarding`
5. Fill onboarding form and submit
6. **Expected**: Returns to `/dashboard` with Quick Book visible
7. Click browser refresh (F5)
8. **Expected**: Stays on `/dashboard` (session persists)
9. Click "Sign out"
10. **Expected**: Redirects to `/login`
11. Try accessing http://localhost:5173/dashboard directly (without login)
12. **Expected**: Redirects to `/login`

**Success Criteria**:
- ✅ Customer redirects to dashboard
- ✅ First-time users see onboarding
- ✅ Session persists on refresh
- ✅ Logout redirects to login
- ✅ Protected routes require authentication

---

### 4. Duplicate Queue Prevention ✅

**Test Steps**:
1. Login as Customer
2. Go to `/customer` (salon discovery page)
3. Find any salon and click "Join Queue"
4. Enter a service (e.g., "Haircut") in the prompt
5. **Expected**: Success message "Joined queue successfully"
6. Click "Join Queue" on the SAME salon again
7. **Expected**: Error message "You're already in the queue for this salon."
8. Try joining a DIFFERENT salon's queue
9. **Expected**: Success (can join multiple different salons)

**Success Criteria**:
- ✅ Cannot join same salon queue twice
- ✅ Clear error message shown
- ✅ Can join different salons' queues

---

### 5. Customer Contact Info in Vendor Dashboard ✅

**Test Steps**:
1. Have a customer join a queue (follow test #4)
2. Login as the Vendor who owns that salon
3. Go to `/vendor`
4. Scroll to "Queue Dashboard" section
5. **Expected**: See table with columns:
   - # (position)
   - Customer (name)
   - **Phone** (customer's phone number)
   - Service
   - Status
   - Joined
   - ETA
   - Actions
6. Verify customer's name and phone number are displayed
7. **Expected**: "Now Serving" and "Next In Line" strips show customer name + service

**Success Criteria**:
- ✅ Phone column exists in table
- ✅ Customer name displayed
- ✅ Customer phone displayed
- ✅ Service displayed
- ✅ Now Serving strip shows correct info

---

### 6. Role-Based Access Control ✅

**Test Steps**:
1. Login as Customer
2. Try accessing http://localhost:5173/vendor
3. **Expected**: Redirects to `/login` (not authorized)
4. Logout and login as Vendor
5. Try accessing http://localhost:5173/customer
6. **Expected**: Redirects to `/login` (not authorized)
7. Try accessing http://localhost:5173/admin
8. **Expected**: Redirects to `/login` (not authorized unless admin)

**Success Criteria**:
- ✅ Customers cannot access vendor routes
- ✅ Vendors cannot access customer routes
- ✅ Only admins can access admin routes

---

### 7. Complete Customer Flow

**Test Steps**:
1. Register as new Customer
2. Complete onboarding (gender, preferred service, etc.)
3. Go to Dashboard → see Quick Book button
4. Click Quick Book → redirects to `/book`
5. Fill booking form:
   - Service (pre-filled if remembered)
   - Stylist (optional)
   - Date & Time
   - Search for salon by name
   - Select salon from dropdown
6. Click "Confirm Booking"
7. **Expected**: Success message → redirects to `/dashboard`
8. **Expected**: "Next Appointment" section shows the booking
9. Go to `/customer` (salon discovery)
10. Search salons by name/city/pincode
11. Click "Nearby" to get location-based results
12. Click "View" on any salon → redirects to `/salon/:id`
13. See salon details, services, queue status
14. Click "Join Queue" → enter service → success
15. Verify queue position and estimated wait time displayed

**Success Criteria**:
- ✅ Onboarding flow works
- ✅ Dashboard shows personalized data
- ✅ Booking creates appointment
- ✅ Search and nearby work
- ✅ Salon detail page loads
- ✅ Queue join works

---

### 8. Complete Vendor Flow

**Test Steps**:
1. Register as new Vendor
2. See "Create Salon" form
3. Fill all fields:
   - Salon name
   - Business email
   - Contact number
   - City
   - Address, Pincode, Lat, Lng
   - Experience years
   - Staff count
   - Chairs count
   - Services (comma-separated)
   - Photos URLs (comma-separated, optional)
4. Click "Create Salon"
5. **Expected**: Success → see "Your Salon" view
6. Verify salon details displayed correctly
7. If photos provided: **Expected**: Photo gallery visible
8. Scroll to "Queue Dashboard"
9. **Expected**: See "Now Serving" and "Next In Line" strips
10. **Expected**: See queue table (may be empty if no customers)
11. Have a customer join your queue (use different browser/incognito)
12. Click "Refresh" on queue dashboard
13. **Expected**: Customer appears in table with name, phone, service
14. Click "Check-in" button
15. **Expected**: Status changes to "checked-in"
16. **Expected**: "Now Serving" strip updates
17. Click "Completed" button
18. **Expected**: Status changes to "completed"
19. Click "No-show" button
20. **Expected**: Status changes to "no-show"

**Success Criteria**:
- ✅ Salon creation works
- ✅ Salon details displayed
- ✅ Photo gallery works
- ✅ Queue dashboard shows customers
- ✅ Status update buttons work
- ✅ Now Serving/Next strips update

---

## Browser Testing

Test on multiple browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if on Mac)

## Mobile Responsiveness

Test on mobile viewport:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test iPhone/Android sizes
4. Verify:
   - ✅ Forms are usable
   - ✅ Tables scroll horizontally if needed
   - ✅ Buttons are tappable
   - ✅ Text is readable

## Performance Testing

1. Open DevTools → Network tab
2. Reload page
3. Check:
   - ✅ API calls complete in < 1 second
   - ✅ No failed requests (red)
   - ✅ Images load properly

## Error Scenarios

### Invalid Login
1. Try login with wrong password
2. **Expected**: "Login failed" error message

### Network Error
1. Stop backend server
2. Try any API action (join queue, create salon)
3. **Expected**: Appropriate error message

### Invalid Token
1. Login successfully
2. Open DevTools → Application → Local Storage
3. Delete `mx_token`
4. Try accessing protected route
5. **Expected**: Redirects to `/login`

### Expired Token
1. Login successfully
2. Wait for token to expire (7 days by default, can shorten for testing)
3. Try accessing protected route
4. **Expected**: Redirects to `/login`

---

## Automated Testing (Optional)

### Unit Tests
```bash
cd frontend-web
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### E2E Tests
```bash
npm install --save-dev @playwright/test
```

---

## Bug Reporting Template

If you find a bug, report it with:

```
**Bug**: [Short description]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Browser**: [Chrome/Firefox/Safari]
**Console Errors**: [Copy from DevTools console]
**Screenshots**: [If applicable]
```

---

## Success Checklist

Before considering the project complete, verify:

- [ ] All 8 test scenarios pass
- [ ] No console errors on any page
- [ ] All API endpoints return expected data
- [ ] Session persists on refresh
- [ ] Logout works correctly
- [ ] Protected routes enforce authentication
- [ ] Role-based access works
- [ ] Duplicate queue prevention works
- [ ] Customer contact info visible to vendor
- [ ] Smooth scrolling works
- [ ] Mobile responsive
- [ ] Works in Chrome, Firefox, Safari

---

## Next Steps After Testing

1. **Google Maps Integration**: Follow `GOOGLE_MAPS_SETUP.md`
2. **Page Transitions**: Add Framer Motion route transitions
3. **Production Deployment**: 
   - Deploy backend to Heroku/Railway/Render
   - Deploy frontend to Vercel/Netlify
   - Update CORS settings
   - Set production environment variables
