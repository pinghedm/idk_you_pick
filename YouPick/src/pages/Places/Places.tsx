import React, { useState, useEffect } from 'react'
import MapsAutoComplete from 'components/MapsAutoComplete/MapsAutoComplete.lazy'
import { PlaceAutocompleteResult } from 'services/map_service'
import { Input, Card, Button } from 'antd'
import { ExportOutlined, StarFilled } from '@ant-design/icons'
export interface PlacesProps {}

const TEMP_PLACE: PlaceAutocompleteResult = {
    name: 'Xochitl Taqueria',
    vicinity: '1015 Fulton Street, Brooklyn',
    website: 'https://xochitlnyc.com/',
    place_id: 'ChIJA3VMyaJbwokRWyzh_U8tEIg',
    url: 'https://maps.google.com/?cid=9804386210370628699',
}

const Places = ({}: PlacesProps) => {
    const [selectedPlace, setSelectedPlace] = useState<PlaceAutocompleteResult | undefined>(
        undefined,
    )
    useEffect(() => {
        setSelectedPlace(TEMP_PLACE)
    })
    return (
        <div>
            {/*<MapsAutoComplete
                onSelect={(place: PlaceAutocompleteResult) => {
                    console.log(place)
                }}
            />*/}
            <Input
                value="Xochitl"
                readOnly
                style={{
                    width: '500px',
                    height: '32px',
                    fontSize: '20px',
                    padding: '5px',
                }}
            />
            {selectedPlace ? (
                <Card title={selectedPlace.name} style={{ width: '500px' }}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1px',
                                alignItems: 'flex-start',
                            }}
                        >
                            <div>{selectedPlace.vicinity}</div>
                            <Button
                                type="text"
                                href={selectedPlace.website}
                                target="_blank"
                                style={{ color: 'blue', paddingLeft: 0 }}
                            >
                                View Website
                                <ExportOutlined />
                            </Button>
                            <Button
                                type="text"
                                href={selectedPlace.url}
                                target="_blank"
                                style={{ color: 'blue', paddingLeft: 0 }}
                            >
                                View In Google Maps
                                <ExportOutlined />
                            </Button>
                        </div>
                        <div>
                            <Button>
                                <StarFilled /> Save To My Places
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : null}
        </div>
    )
}

export default Places
