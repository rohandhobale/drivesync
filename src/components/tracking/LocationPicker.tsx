import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, X } from 'lucide-react';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const pickupIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  className: 'marker-pickup'
});

// India's geographic boundaries
const INDIA_BOUNDS = {
  minLat: 6.5546, // Southernmost point
  maxLat: 35.6745, // Northernmost point
  minLng: 68.1113, // Westernmost point
  maxLng: 97.4166, // Easternmost point
};

type Location = {
  lat: number;
  lng: number;
};

type SearchResult = {
  label: string;
  x: number;
  y: number;
};

type LocationPickerProps = {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
};

// Create empty placeholders for dynamic imports
let OpenStreetMapProvider: any = null;

// Dynamically load geosearch library only in browser environment
if (typeof window !== 'undefined') {
  // Using dynamic import only for the provider
  import('leaflet-geosearch').then(geosearch => {
    OpenStreetMapProvider = geosearch.OpenStreetMapProvider;
  }).catch(err => {
    console.error('Failed to load geosearch:', err);
  });
}

// Map reference component
function MapController({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      mapRef.current = map;
    }
  }, [map, mapRef]);
  
  return null;
}

function LocationMarker({ location, onLocationUpdate }: { 
  location: Location | null;
  onLocationUpdate: (location: Location) => void;
}) {
  useMapEvents({
    click(e) {
      // Check if clicked location is within India
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      if (lat >= INDIA_BOUNDS.minLat && 
          lat <= INDIA_BOUNDS.maxLat && 
          lng >= INDIA_BOUNDS.minLng && 
          lng <= INDIA_BOUNDS.maxLng) {
        onLocationUpdate({ lat, lng });
      } else {
        alert("Please select a location within India.");
      }
    },
  });

  return location ? (
    <Marker 
      position={[location.lat, location.lng]} 
      icon={pickupIcon}
    />
  ) : null;
}

// Enhanced search component with dropdown restricted to India
function EnhancedSearch({ onLocationSelect }: { onLocationSelect: (location: Location) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Function to check if location is within India's boundaries
  const isWithinIndia = (lat: number, lng: number): boolean => {
    return (
      lat >= INDIA_BOUNDS.minLat && 
      lat <= INDIA_BOUNDS.maxLat && 
      lng >= INDIA_BOUNDS.minLng && 
      lng <= INDIA_BOUNDS.maxLng
    );
  };
  
  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input with India filtering
  const handleSearch = async () => {
    if (!query.trim() || !OpenStreetMapProvider) return;
    
    setIsSearching(true);
    try {
      const provider = new OpenStreetMapProvider({
        params: {
          countrycodes: 'in', // ISO 3166-1alpha2 country code for India
          bounded: 1,
          viewbox: `${INDIA_BOUNDS.minLng},${INDIA_BOUNDS.minLat},${INDIA_BOUNDS.maxLng},${INDIA_BOUNDS.maxLat}`,
          limit: 7 // Number of results to return
        }
      });
      
      // First attempt - search with countrycodes and viewbox
      let searchResults = await provider.search({ query });
      
      // If no results, try with "India" appended to the query
      if (searchResults.length === 0) {
        searchResults = await provider.search({ query: `${query} India` });
      }
      
      // Additional filtering in case some results slip through
      const filteredResults = searchResults.filter(result => 
        isWithinIndia(result.y, result.x) && 
        (result.label.includes('India') || result.label.includes('in'))
      );
      
      setResults(filteredResults);
      setShowDropdown(filteredResults.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);

  // Handle location selection
  const handleResultClick = (result: SearchResult) => {
    const location = { lat: result.y, lng: result.x };
    onLocationSelect(location);
    setQuery(result.label);
    setShowDropdown(false);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleResultClick(results[0]);
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div ref={searchRef} className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-200">
      <div className="bg-white rounded-md shadow-lg">
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a location in India"
            className="p-2 flex-grow rounded-l-md border-0 focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          {query && (
            <button 
              type="button" 
              onClick={clearSearch}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 p-2 rounded-r-md text-white"
            disabled={isSearching}
          >
            <Search size={20} />
          </button>
        </form>
      </div>
      
      {/* Search results dropdown */}
      {showDropdown && (
        <div className="mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {results.length > 0 ? (
            <ul className="py-1">
              {results.map((result, index) => (
                <li 
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleResultClick(result)}
                >
                  {result.label}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              {isSearching ? 'Searching...' : 'No locations found in India'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LocationPicker({ 
  onLocationSelect, 
  initialLocation,
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const defaultLocation = { lat: 20.5937, lng: 78.9629 }; // Center of India
  const mapRef = useRef<L.Map | null>(null);

  // Ensure initial location is within India
  useEffect(() => {
    if (initialLocation) {
      if (initialLocation.lat >= INDIA_BOUNDS.minLat && 
          initialLocation.lat <= INDIA_BOUNDS.maxLat && 
          initialLocation.lng >= INDIA_BOUNDS.minLng && 
          initialLocation.lng <= INDIA_BOUNDS.maxLng) {
        setSelectedLocation(initialLocation);
      } else {
        setSelectedLocation(defaultLocation);
      }
    }
  }, [initialLocation]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
    
    // Center map on selected location
    if (mapRef.current) {
      mapRef.current.setView([location.lat, location.lng], 15);
    }
  };

  // Setup map bounds to restrict panning to India
  useEffect(() => {
    if (mapRef.current) {
      const southWest = L.latLng(INDIA_BOUNDS.minLat, INDIA_BOUNDS.minLng);
      const northEast = L.latLng(INDIA_BOUNDS.maxLat, INDIA_BOUNDS.maxLng);
      const bounds = L.latLngBounds(southWest, northEast);
      
      // Set max bounds for map panning
      mapRef.current.setMaxBounds(bounds);
      mapRef.current.on('drag', function() {
        mapRef.current?.panInsideBounds(bounds, { animate: false });
      });
    }
  }, [mapRef.current]);

  return (
    <div className="relative h-96 rounded-lg overflow-hidden shadow-lg border border-gray-200">
      {/* Enhanced search with dropdown */}
      <EnhancedSearch onLocationSelect={handleLocationSelect} />
      
      <MapContainer
        center={initialLocation || defaultLocation}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        minZoom={4} // Prevent zooming out too far
        maxBoundsViscosity={1.0} // Make bounds "sticky"
      >
        {/* Map controller to safely get reference to the map */}
        <MapController mapRef={mapRef} />
        
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          bounds={[
            [INDIA_BOUNDS.minLat, INDIA_BOUNDS.minLng],
            [INDIA_BOUNDS.maxLat, INDIA_BOUNDS.maxLng]
          ]}
        />

        <LocationMarker 
          location={selectedLocation} 
          onLocationUpdate={handleLocationSelect} 
        />
      </MapContainer>
      
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-2 text-center text-sm text-gray-600">
        {selectedLocation 
          ? `Selected: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}` 
          : "Click on the map or search to select a location in India"}
      </div>
    </div>
  );
}