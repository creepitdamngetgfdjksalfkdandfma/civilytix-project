import React from 'react'
const ResultBox = ({result}) => (
  <div className="result">
    <div className="result-name">Location Address: {result.address.freeformAddress}</div>
    <div className="result-name">Location state: {result.address.localName}</div>
    <div className="result-name">Location country: {result.address.country}</div>
    <div className="result-type">City: {result.address.municipalitySubdivision}</div>
    {result.poi ?
      <div className="result-name">Location name: {result.poi.name}</div>
        :
      <h4>Location has no specific name</h4>
    }
  </div>
)
export default ResultBox