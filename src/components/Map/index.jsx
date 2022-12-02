/* React */
import React, { useEffect, useState } from 'react';
/* firebase and geofire */
import firebase from 'firebase/app';
import "firebase/database";
import { GeoFire } from "geofire";
/* leaflet */
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  GeoJSON
} from "react-leaflet";
import { useMap } from "react-leaflet/hooks";
import "./map.css";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import bus from "./bus.png"
import person from "./person.png"

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow
});

const personIcon = new L.Icon({
  iconUrl: person,

  iconSize:     [44, 85],
  iconAnchor:   [22, 85],
  popupAnchor:  [0, -85]
});

const busIcon = new L.Icon({
  iconUrl: bus,

  iconSize:     [44, 44],
  iconAnchor:   [22, 44],
  popupAnchor:  [0, -44]
});

const accessToken = "pk.eyJ1IjoibHVpc2d1dmUiLCJhIjoiY2w5ZnV5MDRuNTdzZDNvb2lvOTdxejUwZyJ9.r9GTud3EyYBVey25QoEGEA";
const url = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${accessToken}`;

const defaultCenter = [10.506098, -66.9146017];

const firebaseConfig = {
  apiKey: "AIzaSyB8r8KMpxn0mfwUr0HIpK2Xjzjib2_Pyrg",
  authDomain: "transporte-10a76.firebaseapp.com",
  projectId: "transporte-10a76",
  storageBucket: "transporte-10a76.appspot.com",
  messagingSenderId: "769212653659",
  appId: "1:769212653659:web:b61135d08a8e78f4ea9f7e",
  measurementId: "G-138LWTSL8P",
  databaseURL: "https://transporte-10a76-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Create a Firebase reference where GeoFire will store its information
const firebaseRef = firebase.database().ref();

// Create a GeoFire index
var geoFire = new GeoFire(firebaseRef);

const Map = (props) => {

  const {
    value,
    onChange,
    latlong
  } = props;

  const changeFile = (e) => {
    const file = (e.target.files || {})[0];

    if (!file) {
      onChange(JSON.stringify({empty: true}));
      return;
    }

    let reader = new FileReader();

    reader.onload = (e) => {
      const str = e.target.result;
      const json = JSON.stringify(JSON.parse(str));
      onChange(json);
    };

    reader.readAsText(file);
  }

  const geoJSONData = value ? JSON.parse(value) : null;

  const [choferes, setChoferes] = useState([]);
  const [pasajeros, setPasajeros] = useState([]);

  const { lat, longt } = latlong;
  const center = [lat, longt];

  return (
    <div>
      <div className="mb-3">
        <p className="fw-bold">Inicio y fin de ruta</p>
        <MapContainer center={center} zoom={14}>
          <TileLayer
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          url={url}
          id={"mapbox/streets-v11"}
          tileSize={512}
          zoomOffset={-1}
          />
          {
            (geoJSONData && !geoJSONData.empty) && <GeoJSON data={geoJSONData} />
          }
          {/*
            choferes.concat(pasajeros).map(data => {
              const markerIcon = data.key.includes("chofer") ? busIcon : personIcon
              return (
                <Marker
                  position={data.location}
                  key={data.key}
                  icon={markerIcon}
                >
                  <Popup>
                    {data.key}<br />
                    {data.location}
                  </Popup>
                </Marker>
              )
            */})
          }
          <MapMoves center={center} />
        </MapContainer>
      </div>
      <div className="mb-3">
        <p fontWeight="bold">Ingresar archivo GeoJSON</p>
        <input
          type="file"
          accept=".json,.geojson"
          onChange={changeFile}
        />
      </div>
      <div className="alert alert-info">
        <div>
          <div>
            <p>
              Para crear un archivo GeoJSON, cree una ruta en coche en <span fontWeight="bold"><a target="_blank" rel="noreferrer" href="https://mymaps.google.com">https://mymaps.google.com</a></span>.
            </p>
          </div>
          <div>
            <p>Luego, exporte la ruta creada a un archivo KMZ.</p>
          </div>
          <div>
            <p>
              Finalmente, convierta este archivo a un formato GeoJSON con la herramienta <span fontWeight="bold"><a target="_blank" rel="noreferrer" href="https://products.aspose.app/gis/es/conversion/kmz-to-geojson">https://products.aspose.app/gis/es/conversion/kmz-to-geojson</a></span> y agregue el archivo resultante aquí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Map;

const MapMoves = ({center}) => {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center)
  }, [center])
  return null
}
