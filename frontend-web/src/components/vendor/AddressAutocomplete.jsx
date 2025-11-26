import React from 'react'
import { useLoadScript, Autocomplete } from '@react-google-maps/api'

const libraries = ['places']

export default function AddressAutocomplete({ defaultValue = '', onAddressSelect }){
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const enabled = Boolean(apiKey)

  // If no API key configured, do not load Google scripts at all
  if (!enabled) {
    return null
  }

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  })

  const [autocomplete, setAutocomplete] = React.useState(null)
  const [address, setAddress] = React.useState(defaultValue)

  const onLoad = (ac) => setAutocomplete(ac)

  const onPlaceChanged = () => {
    if(!autocomplete) return
    const place = autocomplete.getPlace()
    if(place && place.geometry){
      const comps = place.address_components || []
      const get = (type) => comps.find(c => c.types.includes(type))?.long_name || ''
      const payload = {
        address: place.formatted_address || address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        pincode: get('postal_code'),
        city: get('locality') || get('administrative_area_level_2') || '',
      }
      setAddress(payload.address)
      onAddressSelect && onAddressSelect(payload)
    }
  }

  if(!enabled) return null
  if(loadError) return <div className="text-sm text-red-700">Maps failed to load</div>
  if(!isLoaded) return <div className="text-sm text-charcoal/60">Loading maps…</div>

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        type="text"
        value={address}
        onChange={(e)=>setAddress(e.target.value)}
        placeholder="Search your salon address"
        className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal text-charcoal"
      />
    </Autocomplete>
  )
}
