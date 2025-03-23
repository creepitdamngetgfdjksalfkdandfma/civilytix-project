import tt from "@tomtom-international/web-sdk-services";
import { useState } from "react";
import ResultBox from "./ResultBox";

export default function FuzzySearch() {
  const [name, setName] = useState("");
  const [result, setResult] = useState({});

  const fuzzySearch = (name) => {
    tt.services
      .fuzzySearch({
        key: "<Your API Key>",
        query: name
      })
      .go()
      .then((res) => {
        console.log(res);
        const amendRes = res.results;
        console.log(amendRes)
        setResult(amendRes)
        console.log(result)
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
  const resultList = (result.length > 0) ?
     result.map((resultItem) => (
    <div className="col-xs-12 col-md-4 col" key={resultItem.id}>
      <div className="box">
        <ResultBox result={resultItem} />
      </div>
    </div>
  )): <h2>No locations</h2>
    
  return (
    <div className="App">
      <input
        className="input"
        type="text"
        placeholder="Search Location"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            fuzzySearch(name);
          }
        }}
        required
      />
      {resultList}
    </div>
  );
}