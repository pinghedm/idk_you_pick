import React, { useState, useEffect, useMemo } from 'react'
import MapsAutoComplete from 'components/MapsAutoComplete/MapsAutoComplete.lazy'
import { PlaceAutocompleteResult } from 'services/map_service'
import { Input, Card, Button } from 'antd'
import { ExportOutlined, StarFilled } from '@ant-design/icons'
import {
    usePlaces,
    Place,
    useUserPlaceInfos,
    useCreateUserPlaceInfo,
    useCreatePlace,
    UserPlaceInfo,
} from 'services/place_service'
import useDebounce from 'hooks/useDebounce'
export interface PlacesProps {}

const TEMP_PLACE: PlaceAutocompleteResult = {
    name: 'Xochitl Taqueria',
    vicinity: '1015 Fulton Street, Brooklyn',
    website: 'https://xochitlnyc.com/',
    place_id: 'ChIJA3VMyaJbwokRWyzh_U8tEIg',
    url: 'https://maps.google.com/?cid=9804386210370628699',
}

const TEMP_PLACES = Array(20)
    .fill(TEMP_PLACE)
    .map((p, idx) => ({ ...p, place_id: idx }))

const PlaceCard = ({
    place,
    userPlaceInfo,
}: {
    place: Place
    userPlaceInfo: UserPlaceInfo | null
}) => {
    return (
        <Card title={place.name}>
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
                    <div>{place.vicinity}</div>
                    <Button
                        type="text"
                        href={place.website}
                        target="_blank"
                        style={{ color: 'blue', paddingLeft: 0 }}
                    >
                        View Website
                        <ExportOutlined />
                    </Button>
                    <Button
                        type="text"
                        href={place.url}
                        target="_blank"
                        style={{ color: 'blue', paddingLeft: 0 }}
                    >
                        View In Google Maps
                        <ExportOutlined />
                    </Button>
                </div>
                <div>
                    {userPlaceInfo === null ? (
                        <Button>
                            <StarFilled /> Save To My Places
                        </Button>
                    ) : (
                        <div>DESIRE TO EAT AT GOES HERE</div>
                    )}
                </div>
            </div>
        </Card>
    )
}

const Places = ({}: PlacesProps) => {
    const { data: places } = usePlaces()
    const { data: userPlaceInfos } = useUserPlaceInfos()
    const userPlaceInfoByPlaceId = useMemo(
        () =>
            (userPlaceInfos ?? []).reduce(
                (memo, next) => ({ ...memo, [next.place_id]: next }),
                {} as Record<string, UserPlaceInfo>,
            ),
        [userPlaceInfos],
    )

    const createPlaceMutation = useCreatePlace()
    const useCreateUserPlaceInfoMutation = useCreateUserPlaceInfo()

    const [selectedPlace, setSelectedPlace] = useState<PlaceAutocompleteResult | undefined>(
        undefined,
    )
    useEffect(() => {
        setSelectedPlace(TEMP_PLACE)
    }, [])

    const [placeSearchQuery, setPlaceSearchQuery] = useState('')
    const debouncedPlaceSearchQuery = useDebounce(placeSearchQuery, 200)
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '5px',
                height: '100%',
                position: 'relative',
                overflow: 'clip',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                <Input
                    placeholder="Search Places"
                    defaultValue={placeSearchQuery}
                    onChange={e => {
                        setPlaceSearchQuery(e.target.value)
                    }}
                    allowClear
                />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '5px',
                        flex: 1,
                        overflow: 'auto',
                        marginBottom: '50px',
                        marginTop: '15px',
                    }}
                >
                    {TEMP_PLACES?.filter(p =>
                        p.name
                            .toLowerCase()
                            .includes(debouncedPlaceSearchQuery.toLowerCase().trim()),
                    )?.map(p => (
                        <PlaceCard
                            key={p.place_id}
                            place={p}
                            userPlaceInfo={userPlaceInfoByPlaceId?.[p.place_id] ?? null}
                        />
                    ))}
                </div>
            </div>
            <div style={{ width: '400px', height: '500px' }}>
                {/*<MapsAutoComplete
                onSelect={(place: PlaceAutocompleteResult) => {
                    setSelectedPlace(place)
                }}
            />*/}
                <Input
                    value="Xochitl"
                    readOnly
                    style={{
                        width: '400px',
                        height: '32px',
                        fontSize: '20px',
                        padding: '5px',
                    }}
                />
                {selectedPlace ? <PlaceCard place={selectedPlace} userPlaceInfo={null} /> : null}
            </div>
        </div>
    )
}

export default Places
