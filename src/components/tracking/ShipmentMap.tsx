import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { toast } from 'react-toastify';
import { Search, MapPin, Truck, Package, X } from 'lucide-react';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  className: 'marker-pickup text-blue-500'
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  className: 'marker-dropoff text-green-500'
});

const driverIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  className: 'marker-driver text-red-500'
});

const searchIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  className: 'marker-search text-purple-500'
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

type ShipmentMapProps = {
  shipment: any;
  isDriver?: boolean;
  onLocationUpdate?: (location: Location) => void;
  useCustomSearch?: boolean;
};

// Create empty placeholders for dynamic imports
let OpenStreetMapProvider: any = null;

// Dynamically load geosearch library only in browser environment
if (typeof window !== 'undefined') {
  // Only import the provider, not the control
  import('leaflet-geosearch').then(geosearch => {
    OpenStreetMapProvider = geosearch.OpenStreetMapProvider;
  }).catch(err => {
    console.error('Failed to load geosearch provider:', err);
  });
}

function RoutingMachine({ pickup, dropoff }: { pickup: Location; dropoff: Location }) {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !pickup || !dropoff) return;

    // Make sure L.Routing is available
    if (!L.Routing) {
      console.error("Leaflet Routing Machine is not properly loaded");
      return;
    }

    try {
      // Remove previous routing control if it exists
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }

      // Customize the route display
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(pickup.lat, pickup.lng),
          L.latLng(dropoff.lat, dropoff.lng)
        ],
        routeWhileDragging: false,
        showAlternatives: true,
        lineOptions: {
          styles: [
            { color: '#6366F1', opacity: 0.8, weight: 5 },
            { color: '#4F46E5', opacity: 0.5, weight: 8 }
          ],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        addWaypoints: false,
        fitSelectedRoutes: true,
        createMarker: function() { return null; }, // Don't create markers, we handle that
        // Remove the default UI elements we don't want
        collapsible: true,
        show: false // Hide the itinerary
      }).addTo(map);

      routingControlRef.current = routingControl;

      // Fit the map to show the entire route with padding
      routingControl.on('routesfound', function(e) {
        const routes = e.routes;
        const bounds = L.latLngBounds(routes[0].waypoints.map(wp => wp.latLng));
        map.fitBounds(bounds, { padding: [50, 50] });
      });

      return () => {
        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current);
        }
      };
    } catch (err) {
      console.error('Error setting up routing machine:', err);
    }
  }, [map, pickup, dropoff]);

  return null;
}

// Function to check if location is within India's boundaries
const isWithinIndia = (lat: number, lng: number): boolean => {
  return (
    lat >= INDIA_BOUNDS.minLat && 
    lat <= INDIA_BOUNDS.maxLat && 
    lng >= INDIA_BOUNDS.minLng && 
    lng <= INDIA_BOUNDS.maxLng
  );
};

// Enhanced search component with dropdown restricted to India
function EnhancedSearch({ onLocationSelect }: { onLocationSelect: (location: Location) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
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
      toast.error('Error searching for location');
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

export default function ShipmentMap({ 
  shipment, 
  isDriver = false, 
  onLocationUpdate,
  useCustomSearch = true
}: ShipmentMapProps) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<Location | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Load pickup and dropoff locations from shipment
    if (shipment.pickupLocation) {
      setPickupLocation(shipment.pickupLocation);
    }
    if (shipment.dropoffLocation) {
      setDropoffLocation(shipment.dropoffLocation);
    }
  }, [shipment]);

  useEffect(() => {
    if (isDriver && 'geolocation' in navigator) {
      // Get initial location with improved error handling
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          onLocationUpdate?.(location);
          
          // Center map on driver's location if they're the driver
          if (mapRef.current) {
            mapRef.current.setView([location.lat, location.lng], 15);
          }
        },
        (error) => {
          toast.error('Error getting location: ' + error.message);
        },
        { enableHighAccuracy: true }
      );

      // Start watching location
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          onLocationUpdate?.(location);
        },
        (error) => {
          toast.error('Error tracking location: ' + error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      setWatchId(id);

      return () => {
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    }
  }, [isDriver, onLocationUpdate]);

  const handleLocationSelect = (location: Location) => {
    setSearchedLocation(location);
    
    // Center map on the searched location
    if (mapRef.current) {
      mapRef.current.setView([location.lat, location.lng], 15);
    }
  };

  // Safe rendering of location coordinates with null checking
  const formatLocationCoordinate = (loc: Location | null, prop: 'lat' | 'lng') => {
    if (!loc || typeof loc[prop] !== 'number') return '';
    return loc[prop].toFixed(4);
  };

  if (!pickupLocation || !dropoffLocation) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg shadow-lg">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">Waiting for location data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 rounded-lg overflow-hidden shadow-lg border border-gray-200">
      {/* Enhanced search with dropdown */}
      {useCustomSearch && <EnhancedSearch onLocationSelect={handleLocationSelect} />}
      
      <div className="absolute bottom-4 left-4 z-10 flex flex-col space-y-2 bg-white bg-opacity-90 p-3 rounded-lg shadow-md max-w-xs">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Pickup Location</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Dropoff Location</span>
        </div>
        {isDriver && (
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Your Location</span>
          </div>
        )}
        {searchedLocation && (
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Searched Location</span>
          </div>
        )}
      </div>
      
      <MapContainer
        center={[pickupLocation.lat, pickupLocation.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        {/* Map controller to safely get reference to the map */}
        <MapController mapRef={mapRef} />
        
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Pickup Location Marker */}
        <Marker 
          position={[pickupLocation.lat, pickupLocation.lng]}
          icon={pickupIcon}
        >
          <Popup className="custom-popup">
            <div className="font-medium">Pickup Location</div>
            <div className="text-sm text-gray-600">
              {`${formatLocationCoordinate(pickupLocation, 'lat')}, ${formatLocationCoordinate(pickupLocation, 'lng')}`}
            </div>
          </Popup>
        </Marker>

        {/* Dropoff Location Marker */}
        <Marker 
          position={[dropoffLocation.lat, dropoffLocation.lng]}
          icon={dropoffIcon}
        >
          <Popup className="custom-popup">
            <div className="font-medium">Dropoff Location</div>
            <div className="text-sm text-gray-600">
              {`${formatLocationCoordinate(dropoffLocation, 'lat')}, ${formatLocationCoordinate(dropoffLocation, 'lng')}`}
            </div>
          </Popup>
        </Marker>

        {/* Current Location Marker (for driver) */}
        {isDriver && currentLocation && (
          <Marker 
            position={[currentLocation.lat, currentLocation.lng]}
            icon={driverIcon}
          >
            <Popup className="custom-popup">
              <div className="font-medium">Your Current Location</div>
              <div className="text-sm text-gray-600">
                {`${formatLocationCoordinate(currentLocation, 'lat')}, ${formatLocationCoordinate(currentLocation, 'lng')}`}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Searched Location Marker */}
        {searchedLocation && (
          <Marker 
            position={[searchedLocation.lat, searchedLocation.lng]}
            icon={searchIcon}
          >
            <Popup className="custom-popup">
              <div className="font-medium">Searched Location</div>
              <div className="text-sm text-gray-600">
                {`${formatLocationCoordinate(searchedLocation, 'lat')}, ${formatLocationCoordinate(searchedLocation, 'lng')}`}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Display */}
        <RoutingMachine pickup={pickupLocation} dropoff={dropoffLocation} />
      </MapContainer>
    </div>
  );
}