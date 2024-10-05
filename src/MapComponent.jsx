import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import diaphanTinh from './diaphantinhenglish.geojson';
import './MapComponent.css'; // Tạo file CSS cho layout

// Các icon thiên tai (cần thay thế đường dẫn tới các file icon thực tế)
const disasterIcons = {
  flood: L.icon({
    iconUrl: 'https://c7.alamy.com/comp/2EDT9B0/flood-icon-simple-element-from-global-warming-collection-creative-flood-icon-for-web-design-templates-infographics-and-more-2EDT9B0.jpg',
    iconSize: [32, 32],
  }),
  earthquake: L.icon({
    iconUrl: 'https://www.shutterstock.com/shutterstock/photos/1199949499/display_1500/stock-vector-earthquake-icon-vector-with-black-and-white-1199949499.jpg',
    iconSize: [32, 32],
  }),
  storm: L.icon({
    iconUrl: 'https://cdn-icons-png.freepik.com/512/6591/6591989.png',
    iconSize: [32, 32],
  }),
};

const MapComponent = () => {
  const [geoData, setGeoData] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null); // Tỉnh được chọn
  const [drawnCoordinates, setDrawnCoordinates] = useState([]); // Tọa độ được vẽ
  const [disasterType, setDisasterType] = useState(''); // Loại thiên tai
  const [affectedProvinces, setAffectedProvinces] = useState([]); // Danh sách tỉnh có thiên tai
  const [disasterLocations, setDisasterLocations] = useState([]); // Lưu các tỉnh đã có thiên tai

  useEffect(() => {
    // Fetch dữ liệu từ file GeoJSON
    fetch(diaphanTinh)
      .then((response) => response.json())
      .then((data) => setGeoData(data))
      .catch((error) => console.error('Error loading geojson data:', error));
  }, []);

  // Hàm để tính tọa độ trung bình từ danh sách tọa độ
  const calculateCentroid = (coordinates) => {
    let totalLat = 0, totalLng = 0, totalPoints = 0;
    coordinates.forEach(polygon => {
      polygon.forEach(point => {
        totalLng += point[0]; // Lng
        totalLat += point[1]; // Lat
        totalPoints++;
      });
    });
    return [totalLat / totalPoints, totalLng / totalPoints];
  };

  // Hàm kiểm tra nếu thiên tai đã tồn tại trong một tỉnh
  const disasterExists = (name, type) => {
    return disasterLocations.some((disaster) => disaster.name === name && disaster.type === type);
  };
// Hàm để tô màu tỉnh dựa trên điều kiện
const styleFeature = (feature) => {
  return {
    fillColor: feature.properties.Name === selectedProvince ? 'blue' : 'green', // Tô màu đỏ nếu là tỉnh được chọn, màu xanh cho các tỉnh khác
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7,
  };
};

  // Hàm thêm thiên tai cho các tỉnh được chọn
  const addDisaster = () => {
    const newDisasters = geoData.features
      .filter((feature) => affectedProvinces.includes(feature.properties.Name))
      .map((feature) => {
        const name = feature.properties.Name;
        const coordinates = feature.geometry.coordinates;

        // Kiểm tra nếu là Quần đảo Hoàng Sa hoặc Trường Sa
        // if (name === 'Quần đảo Hoàng Sa' || name === 'Quần đảo Trường Sa') {
        //   const centroid = calculateCentroid(coordinates); // Lấy trung tâm của toàn bộ Polygon
        //   const location = { name, type: disasterType, coordinates: centroid };

        //   if (!disasterExists(name, disasterType)) {
        //     console.log('Thêm thiên tai:', location);
        //     return location;
        //   } else {
        //     console.log('Thiên tai đã tồn tại ở:', name);
        //     return null;
        //   }
        // }

        // Kiểm tra các tỉnh còn lại
        if (coordinates && Array.isArray(coordinates)) {
          const centroid = calculateCentroid(coordinates[0]); // Lấy trung bình của Polygon đầu tiên
          const location = { name, type: disasterType, coordinates: centroid };

          if (!disasterExists(name, disasterType)) {
            console.log('Thêm thiên tai:', location);
            return location;
          } else {
            console.log('Thiên tai đã tồn tại ở:', name);
            return null;
          }
        }

        console.log('Không tìm thấy tọa độ cho:', name);
        return null; // Trả về null nếu không có tọa độ hợp lệ
      })
      .filter(Boolean); // Loại bỏ các giá trị null

    setDisasterLocations([...disasterLocations, ...newDisasters]); // Thêm vào mảng
  };

  // Xử lý chọn loại thiên tai
  const handleDisasterChange = (e) => {
    setDisasterType(e.target.value);
  };

  // Xử lý chọn tỉnh bị ảnh hưởng
  const handleAffectedProvincesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setAffectedProvinces(selected);
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
          <select onChange={(e) => setSelectedProvince(e.target.value)}>
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
          <h3>Add Disaster</h3>
          <label>Select Disaster Type:</label>
          <select onChange={handleDisasterChange}>
            <option value="">--Select Disaster Type--</option>
            <option value="flood">Flood</option>
            <option value="earthquake">Earthquake</option>
            <option value="storm">Storm</option>
          </select>

          <label>Select Affected Provinces:</label>
          <select multiple onChange={handleAffectedProvincesChange}>
            {geoData &&
              geoData.features.map((feature) => (
                <option key={feature.properties.Name} value={feature.properties.Name}>
                  {feature.properties.Name}
                </option>
              ))}
          </select>

          <button onClick={addDisaster}>Add Disaster</button>
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

        {/* Hiển thị icon thiên tai cho các tỉnh bị ảnh hưởng */}
        {disasterLocations.map((location, index) => (
          location && location.coordinates && (
            <Marker
              key={index}
              position={[location.coordinates[0], location.coordinates[1]]} // Sử dụng tọa độ trung bình
              icon={disasterIcons[location.type]} // Hiển thị icon tương ứng với loại thiên tai
            />
          )
        ))}

        <MapEvents />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
