import { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import '@tomtom-international/web-sdk-services';

const TomTomMap = () => {
  const mapElement = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [searchInput, setSearchInput] = useState('');
  
  const APIKEY = "pXQeBnDaX0L9POuXZAoMAGF0Vyd2sCby";

  useEffect(() => {
    // Initialize map
    mapInstance.current = tt.map({
      key: APIKEY,
      container: mapElement.current,
      style: `https://api.tomtom.com/style/1/style/*?map=2/basic_street-satellite&poi=2/poi_dynamic-satellite&key=${APIKEY}`,
      center: [79.146881, 12.934968],
      zoom: 14
    });

    // Add click event listener to map
    mapInstance.current.on('click', function(event) {
      const lngLat = event.lngLat;
      const marker = new tt.Marker().setLngLat(lngLat).addTo(mapInstance.current);
      markersRef.current.push(marker);
      mapInstance.current.flyTo({ center: lngLat, zoom: 14 });
    });

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  const searchLocation = (event) => {
    event.preventDefault();
    if (!searchInput) return;
    
    tt.services.fuzzySearch({
      key: APIKEY,
      query: searchInput
    }).then(function(results) {
      if (results.results.length > 0) {
        const result = results.results[0];
        mapInstance.current.flyTo({
          center: result.position,
          zoom: 14
        });
      } else {
        alert("Location not found.");
      }
    }).catch(function(error) {
      console.error("Search failed:", error);
    });
  };

  const clearMarkers = (event) => {
    event.preventDefault();
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    if (mapInstance.current.getLayer('route')) {
      mapInstance.current.removeLayer('route');
      mapInstance.current.removeSource('route');
    }
  };

  const createRoute = (event) => {
    event.preventDefault();
    const locations = markersRef.current.map(marker => marker.getLngLat());
    
    if (locations.length > 1) {
      tt.services.calculateRoute({
        key: APIKEY,
        locations: locations,
        travelMode: 'car'
      }).then(function(response) {
        const geoJSON = response.toGeoJson();
        
        if (mapInstance.current.getLayer('route')) {
          mapInstance.current.removeLayer('route');
          mapInstance.current.removeSource('route');
        }
        
        mapInstance.current.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geoJSON
          },
          paint: {
            'line-color': 'blue',
            'line-width': 5
          }
        });
      }).catch(function(error) {
        console.error("Route creation failed:", error);
      });
    } else {
      alert("Add more markers to create a route.");
    }
  };
  

  const addMarker = (lat, lon) => {
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      alert('Please enter valid latitude and longitude values.');
      return;
    }

    const marker = new tt.Marker().setLngLat([lon, lat]).addTo(mapInstance.current);
    markersRef.current.push(marker);
    mapInstance.current.flyTo({ center: [lon, lat], zoom: 14 });
  };

  return (
    <div className="w-full">
      <div className="bg-slate-100 p-4 rounded-lg mb-4">
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
          />
          <button 
            type="button" 
            onClick={searchLocation}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Search
          </button>
        </div>
      </div>
      
      <div 
        id="map" 
        ref={mapElement} 
        className="h-[500px] mb-5 rounded-lg shadow-md"
      ></div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* 
        <button 
          type="button" 
          onClick={createRoute} 
          className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Create Route
        </button>
         */}
        <button 
          type="button" 
          onClick={clearMarkers} 
          className="text-gray-900 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Clear Markers
        </button>
      </div>
    </div>
  );
};

export default TomTomMap;
