import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import diaphanTinh from './diaphantinhenglish.geojson';
import './MapComponent.css'; // Tạo file CSS cho layout

const MapComponent = () => {
  const [geoData, setGeoData] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null); // Tỉnh được chọn
  const [drawnCoordinates, setDrawnCoordinates] = useState([]); // Tọa độ được vẽ

  useEffect(() => {
    // Fetch dữ liệu từ file GeoJSON
    fetch(diaphanTinh)
      .then((response) => response.json())
      .then((data) => setGeoData(data))
      .catch((error) => console.error('Error loading geojson data:', error));
  }, []);

  // Hàm để tô màu tỉnh dựa trên điều kiện
  const styleFeature = (feature) => {
    return {
      fillColor: feature.properties.Name === selectedProvince ? 'red' : 'green',
      weight: 2,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7,
    };
  };

  // Xử lý chọn tỉnh từ danh sách
  const handleSelectProvince = (e) => {
    setSelectedProvince(e.target.value);
  };

  // Sử dụng sự kiện map để vẽ tọa độ
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setDrawnCoordinates([...drawnCoordinates, [e.latlng.lat, e.latlng.lng]]);
      },
    });
    return null;
  };

  return (
    <div className="map-container">
      <div className="sidebar">
        <h2>Select Province or Draw</h2>
        <div>
          <label>Select a Province:</label>
          <select onChange={handleSelectProvince}>
            <option value="">--Select Province--</option>
            {geoData &&
              geoData.features.map((feature) => (
                <option key={feature.properties.Name} value={feature.properties.Name}>
                  {feature.properties.Name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <h3>Coordinates Drawn</h3>
          <ul>
            {drawnCoordinates.map((coord, index) => (
              <li key={index}>{`Lat: ${coord[0]}, Lng: ${coord[1]}`}</li>
            ))}
          </ul>
        </div>
      </div>

      <MapContainer center={[21.0285, 105.8542]} zoom={6} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoData && <GeoJSON data={geoData} style={styleFeature} />}
        <MapEvents />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
