// import { useRef, useEffect } from 'react'
import { useQuery } from 'react-query'
// import { Input } from 'antd'
declare global {
    interface Window {
        google: any
    }
}

export const PlacesAPIAttributes = ['name', 'vicinity', 'website', 'place_id', 'url'] as const
// type _googlePlaceResult = Record<typeof PlacesAPIAttributes[number], string>
// let _googlePlacesServiceStatus: Record<string, string>
// type _googlePlacesServiceCallbackType = (
//     res: _googlePlaceResult[],
//     status: typeof _googlePlacesServiceStatus[string],
// ) => void
// let _googlePlacesService: {
//     findPlaceFromQuery: (
//         request: {
//             query: string
//             fields: typeof PlacesAPIAttributes[number][]
//             locationBias?: string
//         },
//         cb: _googlePlacesServiceCallbackType,
//     ) => void
// }

export interface PlaceAutocompleteResult extends Record<typeof PlacesAPIAttributes[number], any> {
    name: string
    vicinity: string // this is the short address, just street number and name
    website: string // this is the url that google thinks is the places
    place_id: string
    url: string // this is the url to google maps page on the place
}

interface _googlePlacesAutoCompleteType {
    // constructor(input: HTMLInputElement, options: any) {}
    // addListener(eventName: string, cb: () => void) {}
    // getPlace(): PlaceAutocompleteResult {
    //     // this is just going to get overridden
    //     return {} as PlaceAutocompleteResult
    // }
    getPlacePredictions: (options: any) => Promise<PlaceAutocompleteResult>
}
export let _googlePlacesAutoComplete: _googlePlacesAutoCompleteType

export async function initMap(): Promise<void> {
    const { AutocompleteService } = await window.google.maps.importLibrary('places')
    debugger
    _googlePlacesAutoComplete = AutocompleteService
}

const NYC = { lat: 40.7128, lng: -74.006 }
const defaultBounds = {
    north: NYC.lat + 0.1,
    south: NYC.lat - 0.1,
    east: NYC.lng + 0.1,
    west: NYC.lng - 0.1,
}
const options = {
    bounds: defaultBounds,
    componentRestrictions: { country: 'us' },
    fields: PlacesAPIAttributes,
    strictBounds: true,
    types: ['restaurant'],
}
export const useAutocompleteSuggestions = (query: string, enabled: boolean) => {
    const rqQuery = useQuery(
        ['locationByName', query],
        () => _googlePlacesAutoComplete.getPlacePredictions({ input: query, ...options }),
        { enabled },
    )
    return rqQuery
}

// const queryLocationByName = (query: string, cb?: _googlePlacesServiceCallbackType) => {
//     _googlePlacesService.findPlaceFromQuery(
//         { query, fields: [...PlacesAPIAttributes], locationBias: 'IP_BIAS' },
//         (res, status) => {
//             cb ? cb(res, status) : () => {}
//         },
//     )
// }

// export const useQueryLocationByName = (query: string, enabled: boolean) => {
//     const rqQuery = useQuery(
//         ['locationByName', query],
//         () => {
//             const results = new Promise((promiseRes, rej) => {
//                 queryLocationByName(query, (res, status) => {
//                     if (status === _googlePlacesServiceStatus.OK) {
//                         return promiseRes(res)
//                     } else {
//                         rej()
//                     }
//                 })
//             })
//             return results
//         },
//         { enabled },
//     )
//     return rqQuery
// }
