// This function below will convert the data in states.js to geojson format 
//Week 3 Task 1

export const convertToGeoJSON = (data) => {
    const geoJsonForm = {
      type: 'FeatureCollection',
      features: data.map((state) => ({
        type: 'Feature',
        properties: {
          name: state.name,
          id: state.id,
          CENSUSAREA: state.CENSUSAREA,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [state.geometry[0]],
        },
      })),
    };
  
    return geoJsonForm;
  };
  