// App.js
import Select from 'react-select';
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import './App.css';
import { states, geoJsonData } from './states.js';
import ReactSlider from 'react-slider';


mapboxgl.accessToken = 'pk.eyJ1Ijoic2h1YmhhbTc1IiwiYSI6ImNrYjhyYTN0YTA2emkyc3AwdG94c2ZjcmsifQ.Whu-ZPpnHEVZLr6NIZVFGQ';

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(3);
  const [opacity, setOpacity] = useState(0.5); // Add opacity stat
  const [selectedOption, setSelectedOption] = useState(null);
  const [layerOpacity, setLayerOpacity] = useState(0.5); 
  const [selectedState, setSelectedState] = useState(null); 

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    console.log(geoJsonData);

    map.current.on('load', () => {
      map.current.addSource('states', { type: 'geojson', data: geoJsonData });

      // Add a new layer to visualize the polygon.
      map.current.addLayer({
        id: 'states',
        type: 'fill',
        source: 'states', // reference the data source
        layout: {},
        paint: {
          'fill-color': [
            'match',
            ['get', 'name'],
            'Arizona', '#FF5733',
            'Connecticut', '#33FF57',
            'Colorado', '#5733FF',
            // Add more states and colors as needed
            '#808080' // Default color for unspecified states
          ],
          'fill-opacity': 0.5,
        },
      });
      // Add a black outline around the polygon.
      map.current.addLayer({
        id: 'outline',
        type: 'line',
        source: 'states',
        layout: {},
        paint: {
          'line-color': '#000',
          'line-width': 3,
        },
      });

      // Add a click event listener to change color on click
      map.current.on('click', 'states', (e) => {
        const clickedState = e.features[0].properties.name;
        const updatedColor = '#FF0000'; // Change this to the color you want on click

        map.current.setPaintProperty('states', 'fill-color', [
          'match',
          ['get', 'name'],
          clickedState, updatedColor,
          'Arizona', '#FD5733',
          'Connecticut', '#33FF57',
          'Colorado', '#5733FF',
          '#808080' // Default color for unspecified states
        ]);
      });

      // Change the cursor to a pointer when hovering over the states layer.
      map.current.on('mouseenter', 'states', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.current.on('mouseleave', 'states', () => {
        map.current.getCanvas().style.cursor = '';
      });
    });
  }, [lng, lat, zoom]);
  

  const handleChange = (option) => {
    setSelectedState(option.value);
    setOpacity(0.5); // Reset opacity when selecting a new state
    map.current.setPaintProperty('states', 'fill-color', [
      'match',
      ['get', 'name'],
      option.value, '#FF0000',
      '#808080',
    ]);
  };

  const opacityChange = (value) => {
    const opacityValue = parseFloat(value / 100);
    setOpacity(opacityValue);
    map.current.setPaintProperty('states', 'fill-opacity', opacityValue);
  };
  

  const renderThumb = (props, state) => (
    <div {...props} style={{ ...props.style, backgroundColor: `rgba(255, 0, 0, ${state.value / 100})` }} />
  );

  const options = [
    { value: 'Arizona', label: 'Arizona' },
    { value: 'Colorado', label: 'Colorado' },
    { value: 'Connecticut', label: 'Connecticut' }
    // Add more states as needed
  ];

  const layerOpacityChange = (value) => {
    const layerOpacityValue = parseFloat(value / 100);
    setLayerOpacity(layerOpacityValue);

    // Set opacity for both fill and border
    map.current.setPaintProperty('states', 'fill-opacity', layerOpacityValue);
    map.current.setPaintProperty('outline', 'line-opacity', layerOpacityValue);
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isSelected ? '#FF0000' : provided.borderColor,
      boxShadow: state.isSelected ? '0 0 0 1px #FF0000' : provided.boxShadow,
    }),
  };

  return (
    <div>
      <div className="opacity-slider-container">
        <ReactSlider
          min={0}
          max={100}
          step={1}
          value={opacity * 100}
          onChange={opacityChange}
          className="opacity-slider"
          thumbClassName="opacity-slider-thumb"
          trackClassName="opacity-slider-track"
          renderThumb={renderThumb}
        />
      </div>
      <div className="layer-opacity-container">
        <ReactSlider
          min={0}
          max={100}
          step={1}
          value={layerOpacity * 100}
          onChange={layerOpacityChange}
          className="layer-opacity-slider"
          thumbClassName="layer-opacity-thumb"
          trackClassName="layer-opacity-track"
          renderThumb={renderThumb}
        />
        </div>
      <div className='react-select-container'>
      <Select
          value={options.find((option) => option.value === selectedState)}
          onChange={handleChange}
          options={options}
          styles={customStyles}
        />
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}