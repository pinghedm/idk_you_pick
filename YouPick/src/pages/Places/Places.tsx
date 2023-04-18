import React from "react";
import { MapsAutoComplete } from "services/map_service";

export interface PlacesProps {}

const Places = ({}: PlacesProps) => {
  return (
    <div>
      <MapsAutoComplete
        onSelect={(place) => {
          console.log(place);
        }}
      />
    </div>
  );
};

export default Places;
