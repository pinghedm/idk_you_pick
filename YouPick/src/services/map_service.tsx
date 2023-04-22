// import { useRef, useEffect } from 'react'
import { useQuery } from 'react-query'
// import { Input } from 'antd'
const NYC = { lat: 40.7128, lng: -74.006 }
const defaultBounds = {
    north: NYC.lat + 0.1,
    south: NYC.lat - 0.1,
    east: NYC.lng + 0.1,
    west: NYC.lng - 0.1,
}
export const PlacesAPIAttributes = ['name', 'vicinity', 'website', 'place_id', 'url'] as const

interface PlacePredictionRequest {
    bounds: { north: number; south: number; east: number; west: number }
    componentRestrictions: { country: string }
    strictBounds: boolean
    types: string[]
    input: string
}

interface PredictionResult {
    description: string
    matched_substrings: any[]
    place_id: string
}

declare global {
    interface Window {
        google: any
        _googlePlacesAutoComplete: {
            getPlacePredictions: (
                request: PlacePredictionRequest,
            ) => Promise<{ predictions: PredictionResult[] }>
        }
        _googlePlacesService: {
            getDetails: (
                request: {
                    placeId: string
                    fields: typeof PlacesAPIAttributes[number][]
                },
                callback: (result: PlaceAutocompleteResult, status: string) => void,
            ) => void
        }
        _googlePlacesServiceStatus: Record<string, string>
    }
}

export interface PlaceAutocompleteResult extends Record<typeof PlacesAPIAttributes[number], any> {
    name: string
    vicinity: string // this is the short address, just street number and name
    website: string // this is the url that google thinks is the places
    place_id: string
    url: string // this is the url to google maps page on the place
}

const PLACE_PREDICTION_DEFAULT_OPTIONS: Omit<PlacePredictionRequest, 'input'> = {
    bounds: defaultBounds,
    componentRestrictions: { country: 'us' },
    strictBounds: true,
    types: ['restaurant'],
}
export const useAutocompleteSuggestions = (query: string, enabled: boolean) => {
    const rqQuery = useQuery(
        ['G_placeAutocomplete', query],
        () =>
            window._googlePlacesAutoComplete.getPlacePredictions({
                input: query,
                ...PLACE_PREDICTION_DEFAULT_OPTIONS,
            }),
        { enabled },
    )
    return rqQuery
}

export const usePlaceDetails = (placeId: string) => {
    const rqQuery = useQuery(
        ['G_getPlaceDetails', placeId],
        () => {
            const result = new Promise((promiseRes, rej) => {
                window._googlePlacesService.getDetails(
                    { placeId, fields: [...PlacesAPIAttributes] },
                    (place, status) => {
                        console.log(place, status, status === window._googlePlacesServiceStatus.OK)
                        if (status === window._googlePlacesServiceStatus.OK) {
                            return promiseRes(place)
                        } else {
                            rej()
                        }
                    },
                )
            })
            return result
        },
        { enabled: !!placeId },
    )
    return rqQuery
}
