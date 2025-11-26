# Google Maps Autocomplete Setup Guide

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key
6. Restrict the key (recommended):
   - Application restrictions: HTTP referrers
   - Add your domain: `http://localhost:5173/*` for dev
   - API restrictions: Select the 3 APIs above

## Step 2: Install Required Package

```bash
cd frontend-web
npm install @react-google-maps/api
```

## Step 3: Add API Key to Environment

Create or update `frontend-web/.env`:
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Step 4: Create AddressAutocomplete Component

Create `frontend-web/src/components/vendor/AddressAutocomplete.jsx`:

```javascript
import React from 'react'
import { useLoadScript, Autocomplete } from '@react-google-maps/api'

const libraries = ['places']

export default function AddressAutocomplete({ onAddressSelect, defaultValue = '' }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  const [autocomplete, setAutocomplete] = React.useState(null)
  const [address, setAddress] = React.useState(defaultValue)

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance)
  }

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace()
      
      if (place.geometry) {
        const addressData = {
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          pincode: extractPincode(place.address_components),
          city: extractCity(place.address_components),
        }
        
        setAddress(place.formatted_address)
        onAddressSelect(addressData)
      }
    }
  }

  const extractPincode = (components) => {
    const postal = components?.find(c => c.types.includes('postal_code'))
    return postal?.long_name || ''
  }

  const extractCity = (components) => {
    const city = components?.find(c => 
      c.types.includes('locality') || c.types.includes('administrative_area_level_2')
    )
    return city?.long_name || ''
  }

  if (loadError) return <div className="text-red-700">Error loading maps</div>
  if (!isLoaded) return <div className="text-charcoal/60">Loading maps...</div>

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Search for your salon address..."
        className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal text-charcoal"
      />
    </Autocomplete>
  )
}
```

## Step 5: Update Vendor Component

In `frontend-web/src/components/vendor/Vendor.jsx`, replace the manual address/lat/lng inputs with:

```javascript
import AddressAutocomplete from './AddressAutocomplete'

// In the form section, replace location inputs with:
<div className="sm:col-span-2">
  <label className="block text-sm mb-1">Salon Address</label>
  <AddressAutocomplete
    defaultValue={form.location.address}
    onAddressSelect={(data) => {
      setForm(f => ({
        ...f,
        location: {
          address: data.address,
          lat: data.lat,
          lng: data.lng,
          pincode: data.pincode,
        },
        city: data.city,
      }))
    }}
  />
</div>
```

## Step 6: Add Edit Profile Functionality

Update `Vendor.jsx` to add edit mode:

```javascript
const [editMode, setEditMode] = React.useState(false)

// Add this button in the salon view section:
<button 
  onClick={() => setEditMode(true)} 
  className="px-4 py-2 rounded text-charcoal mt-4"
  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)' }}
>
  Edit Profile
</button>

// When editMode is true, show the form with pre-filled values
// Add a backend endpoint to handle updates
```

## Step 7: Backend Update Endpoint

Add to `backend-node/src/controllers/salonController.js`:

```javascript
async function updateSalon(req, res) {
  try {
    const { id } = req.params
    const salon = await Salon.findOne({ _id: id, ownerId: req.user.id })
    
    if (!salon) {
      return res.status(404).json({ error: 'Salon not found or unauthorized' })
    }
    
    const allowedUpdates = ['name', 'businessEmail', 'contactNo', 'city', 'location', 
                           'experienceYears', 'staffCount', 'chairsCount', 'services', 'photos']
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        salon[field] = req.body[field]
      }
    })
    
    await salon.save()
    return res.json(salon)
  } catch (err) {
    return res.status(400).json({ error: 'Update failed' })
  }
}

module.exports = { /* existing exports */, updateSalon }
```

Add route in `backend-node/src/routes/salonRoutes.js`:

```javascript
router.put('/:id', authMiddleware, requireRoles('vendor', 'admin'), updateSalon)
```

## Step 8: Test

1. Start backend: `cd backend-node && npm run dev`
2. Start frontend: `cd frontend-web && npm run dev`
3. Login as vendor
4. Try address autocomplete
5. Verify address, lat/lng, city, pincode are saved
6. Test edit profile functionality

## Troubleshooting

### API Key Issues
- Ensure Places API is enabled
- Check API key restrictions
- Verify billing is enabled (Google requires it even for free tier)

### Autocomplete Not Working
- Check browser console for errors
- Verify API key in .env file
- Ensure libraries array includes 'places'

### Address Not Saving
- Check network tab for API call
- Verify backend receives correct data format
- Check MongoDB for saved document

## Cost Considerations

Google Maps has a free tier:
- $200 free credit per month
- Places Autocomplete: $2.83 per 1000 requests (after free tier)
- For development/small scale, you'll stay within free tier

## Security Best Practices

1. **Never commit API key to git**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Restrict API key**
   - Set HTTP referrer restrictions
   - Limit to specific APIs
   - Monitor usage in Google Cloud Console

3. **Backend validation**
   - Always validate address data on backend
   - Don't trust client-side coordinates
   - Sanitize address strings before saving
