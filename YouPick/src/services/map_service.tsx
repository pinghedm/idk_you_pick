import { useRef, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Input } from 'antd'

type _googleFieldTypes = 'name' | 'vicinity' | 'website' // not full list, see https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult
type _googlePlaceResult = Record<_googleFieldTypes, string>
let _googlePlacesServiceStatus: Record<string, string>
type _googlePlacesServiceCallbackType = (
    res: _googlePlaceResult[],
    status: typeof _googlePlacesServiceStatus[string],
) => void
let _googlePlacesService: {
    findPlaceFromQuery: (
        request: {
            query: string
            fields: _googleFieldTypes[]
        },
        cb: _googlePlacesServiceCallbackType,
    ) => void
}

export const PlacesAPIAttributes = ['name', 'vicinity', 'website', 'place_id', 'url'] as const

export interface PlaceAutocompleteResult extends Record<typeof PlacesAPIAttributes[number], any> {
    name: string
    vicinity: string // this is the short address, just street number and name
    website: string // this is the url that google thinks is the places
    place_id: string
    url: string // this is the url to google maps page on the place
}

class _googlePlacesAutoCompleteType {
    constructor(input: HTMLInputElement, options: any) {}
    addListener(eventName: string, cb: () => void) {}
    getPlace(): PlaceAutocompleteResult {
        // this is just going to get overridden
        return {} as PlaceAutocompleteResult
    }
}
export let _googlePlacesAutoComplete: typeof _googlePlacesAutoCompleteType

export async function initMap(): Promise<void> {
    const {
        PlacesService,
        PlacesServiceStatus,
        Autocomplete,
        //@ts-ignore
    } = await window.google.maps.importLibrary('places')
    _googlePlacesService = PlacesService
    _googlePlacesServiceStatus = PlacesServiceStatus
    _googlePlacesAutoComplete = Autocomplete
}

export const queryLocationByName = (query: string, cb?: _googlePlacesServiceCallbackType) => {
    _googlePlacesService.findPlaceFromQuery(
        { query, fields: ['name', 'vicinity', 'website'] },
        (res, status) => {
            cb ? cb(res, status) : () => {}
        },
    )
}

export const useQueryLocationByName = (query: string) => {
    const rqQuery = useQuery(['locationByName', query], () => {
        const results = new Promise((promiseRes, rej) => {
            queryLocationByName(query, (res, status) => {
                if (status === _googlePlacesServiceStatus.OK) {
                    return promiseRes(res)
                } else {
                    rej()
                }
            })
        })
        return results
    })
    return rqQuery
}
