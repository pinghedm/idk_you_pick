import { useRef, useEffect } from "react";
import { useQuery } from "react-query";

type _googleFieldTypes = "name" | "vicinity" | "website"; // not full list, see https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult
type _googlePlaceResult = Record<_googleFieldTypes, string>;
let _googlePlacesServiceStatus: Record<string, string>;
type _googlePlacesServiceCallbackType = (
    res: _googlePlaceResult[],
    status: typeof _googlePlacesServiceStatus[string]
) => void;
let _googlePlacesService: {
    findPlaceFromQuery: (
        request: {
            query: string;
            fields: _googleFieldTypes[];
        },
        cb: _googlePlacesServiceCallbackType
    ) => void;
};

class _googlePlacesAutoCompleteType {
    constructor(input: HTMLInputElement, options: any) {}
    addListener(eventName: string, cb: () => void) {}
    getPlace() {}
}
let _googlePlacesAutoComplete: typeof _googlePlacesAutoCompleteType;

export async function initMap(): Promise<void> {
    const {
        PlacesService,
        PlacesServiceStatus,
        Autocomplete,
        //@ts-ignore
    } = await window.google.maps.importLibrary("places");
    _googlePlacesService = PlacesService;
    _googlePlacesServiceStatus = PlacesServiceStatus;
    _googlePlacesAutoComplete = Autocomplete;
}

export const MapsAutoComplete = () => {
    const NYC = { lat: 40.7128, lng: -74.006 };
    const defaultBounds = {
        north: NYC.lat + 0.1,
        south: NYC.lat - 0.1,
        east: NYC.lng + 0.1,
        west: NYC.lng - 0.1,
    };
    const inputRef = useRef<HTMLInputElement>(null);
    const options = {
        bounds: defaultBounds,
        componentRestrictions: { country: "us" },
        fields: ["name", "vicinity", "website"],
        strictBounds: true,
        types: ["restaurant"],
    };
    useEffect(() => {
        if (inputRef.current) {
            const autoComplete = new _googlePlacesAutoComplete(
                inputRef.current,
                options
            );
            autoComplete.addListener("place_changed", () => {
                const place = autoComplete.getPlace();
                console.log(place);
            });
        }
    }, []);

    return (
        <input type="text" placeholder="Search Restaurants" ref={inputRef} />
    );
};

const queryLocationByName = (
    query: string,
    cb?: _googlePlacesServiceCallbackType
) => {
    _googlePlacesService.findPlaceFromQuery(
        { query, fields: ["name", "vicinity", "website"] },
        (res, status) => {
            console.log(res, status);
            cb ? cb(res, status) : () => {};
        }
    );
};

export const useQueryLocationByName = (query: string) => {
    const rqQuery = useQuery(["locationByName", query], () => {
        const results = new Promise((promiseRes, rej) => {
            console.log(111, query);
            queryLocationByName(query, (res, status) => {
                console.log(res, status);
                if (status === _googlePlacesServiceStatus.OK) {
                    return promiseRes(res);
                } else {
                    rej();
                }
            });
        });
        return results;
    });
    return rqQuery;
};
