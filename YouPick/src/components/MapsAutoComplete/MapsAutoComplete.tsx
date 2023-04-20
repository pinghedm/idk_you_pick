import React, { useEffect, useRef } from 'react'
import {
    PlaceAutocompleteResult,
    PlacesAPIAttributes,
    _googlePlacesAutoComplete,
} from 'services/map_service'
import { Button } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
export interface MapsAutoCompleteProps {
    onSelect: (place: PlaceAutocompleteResult) => void
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
const MapsAutoComplete = ({ onSelect }: { onSelect: (place: PlaceAutocompleteResult) => void }) => {
    const inputRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
        if (inputRef.current) {
            const autoComplete = new _googlePlacesAutoComplete(inputRef.current, options)
            autoComplete.addListener('place_changed', () => {
                const place = autoComplete.getPlace()
                onSelect(place)
            })
        }
    }, [onSelect])

    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '5px', width: '500px' }}>
            <input
                type="text"
                placeholder="Search Restaurants..."
                ref={inputRef}
                style={{
                    height: '32px',
                    fontSize: '20px',
                    padding: '5px',
                }}
            />
            <Button
                icon={<CloseOutlined />}
                onClick={() => {
                    const input = inputRef.current
                    if (input) {
                        input.value = ''
                    }
                }}
            />
        </div>
    )
}
export default MapsAutoComplete
