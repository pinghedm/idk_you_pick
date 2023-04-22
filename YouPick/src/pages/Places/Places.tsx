import React, { useState, useEffect, useMemo } from 'react'
import {
    PlaceAutocompleteResult,
    useAutocompleteSuggestions,
    usePlaceDetails,
} from 'services/map_service'
import { Input, Card, Button, Switch, AutoComplete } from 'antd'
import { ExportOutlined, StarFilled, StarOutlined, DeleteOutlined } from '@ant-design/icons'
import {
    usePlaces,
    Place,
    useUserPlaceInfos,
    useCreateUserPlaceInfo,
    useCreatePlace,
    UserPlaceInfo,
} from 'services/place_service'
import useDebounce from 'hooks/useDebounce'
import MapsAutoComplete from 'components/MapsAutoComplete/MapsAutoComplete.lazy'
export interface PlacesProps {}

const TEMP_PLACE: PlaceAutocompleteResult = {
    name: 'Xochitl Taqueria',
    vicinity: '1015 Fulton Street, Brooklyn',
    website: 'https://xochitlnyc.com/',
    place_id: 'ChIJA3VMyaJbwokRWyzh_U8tEIg',
    url: 'https://maps.google.com/?cid=9804386210370628699',
}

const TEMP_PLACES: PlaceAutocompleteResult[] = Array(1)
    .fill(TEMP_PLACE)
    .map((p, idx) => ({ ...p, place_id: idx }))

const PlaceCard = ({
    place,
    userPlaceInfo,
    showSave,
}: {
    place: Place
    userPlaceInfo: UserPlaceInfo | null
    showSave: boolean
}) => {
    const [newPlaceInfo, setNewPlaceInfo] = useState<Omit<UserPlaceInfo, 'user_id' | 'place_id'>>({
        desire: null,
        rating: null,
        hard_no: false,
    })
    return (
        <Card
            title={
                <div>
                    {place.name} • {place.vicinity}
                </div>
            }
            style={{ width: '100%' }}
            bodyStyle={{ paddingTop: '3px' }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '5px',
                    }}
                >
                    <Button href={place.website} target="_blank" style={{ color: 'blue' }}>
                        View Website
                        <ExportOutlined />
                    </Button>
                    <Button href={place.url} target="_blank" style={{ color: 'blue' }}>
                        View In Google Maps
                        <ExportOutlined />
                    </Button>
                </div>
                {userPlaceInfo?.hard_no ? (
                    <HardNo
                        hardNo={showSave ? newPlaceInfo.hard_no : userPlaceInfo?.hard_no ?? false}
                        onChange={hardNo => {
                            if (showSave) {
                                setNewPlaceInfo(pi => ({ ...pi, hard_no: hardNo }))
                            } else {
                                console.log(hardNo)
                            }
                        }}
                    />
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                        }}
                    >
                        <Rating
                            label="Interest"
                            currentRating={
                                showSave ? newPlaceInfo.desire : userPlaceInfo?.desire ?? null
                            }
                            onSelect={newDesire => {
                                if (showSave) {
                                    setNewPlaceInfo(pi => ({ ...pi, desire: newDesire }))
                                } else {
                                    console.log(newDesire)
                                }
                            }}
                        />
                        <Rating
                            label="Rating"
                            currentRating={
                                showSave ? newPlaceInfo.rating : userPlaceInfo?.rating ?? null
                            }
                            onSelect={newRating => {
                                if (showSave) {
                                    setNewPlaceInfo(pi => ({ ...pi, rating: newRating }))
                                } else {
                                    console.log(newRating)
                                }
                            }}
                        />
                        <HardNo
                            hardNo={
                                showSave ? newPlaceInfo.hard_no : userPlaceInfo?.hard_no ?? false
                            }
                            onChange={hardNo => {
                                if (showSave) {
                                    setNewPlaceInfo(pi => ({ ...pi, hard_no: hardNo }))
                                } else {
                                    console.log(hardNo)
                                }
                            }}
                        />
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                {showSave ? (
                    <Button
                        type="primary"
                        onClick={() => {
                            console.log('save')
                        }}
                    >
                        Save
                    </Button>
                ) : null}
            </div>
        </Card>
    )
}

const HardNo = ({ hardNo, onChange }: { hardNo: boolean; onChange: (hardNo: boolean) => void }) => {
    return (
        <div
            style={{
                fontSize: '24px',
                display: 'flex',
                flexDirection: 'row',
                gap: '5px',
                alignItems: 'center',
            }}
        >
            Hard No: <Switch checked={hardNo} onChange={onChange} />
        </div>
    )
}

const Rating = ({
    currentRating,
    onSelect,
    label,
}: {
    label: string
    currentRating: number | null
    onSelect: (newRating: number | null) => void
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '5px',
                fontSize: '24px',
                alignItems: 'center',
            }}
        >
            <span style={{ width: '100px' }}>{label}: </span>
            {[1, 2, 3, 4, 5].map(rating => {
                if (currentRating === null || rating > currentRating) {
                    return (
                        <StarOutlined
                            key={rating}
                            onClick={() => {
                                onSelect(rating)
                            }}
                        />
                    )
                } else {
                    return (
                        <StarFilled
                            key={rating}
                            onClick={() => {
                                onSelect(rating)
                            }}
                        />
                    )
                }
            })}
            <Button
                icon={<DeleteOutlined />}
                onClick={() => {
                    onSelect(null)
                }}
            />
        </div>
    )
}

const Places = ({}: PlacesProps) => {
    // const { data: _places } = usePlaces()
    const _places = TEMP_PLACES
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

    const [selectedPlaceID, setSelectedPlaceID] = useState<string | undefined>(undefined)
    const { data: newPlaceDetails } = usePlaceDetails(selectedPlaceID ?? '')

    const [placeSearchQuery, setPlaceSearchQuery] = useState('')
    const debouncedPlaceSearchQuery = useDebounce(placeSearchQuery, 200)

    const places = useMemo(
        () =>
            (_places ?? []).filter(p =>
                p.name
                    .toLowerCase()
                    .includes(debouncedPlaceSearchQuery?.toLowerCase()?.trim() ?? ''),
            ),
        [_places, debouncedPlaceSearchQuery],
    )
    const { data: _autoCompleteSuggestions } = useAutocompleteSuggestions(
        debouncedPlaceSearchQuery,
        debouncedPlaceSearchQuery.length > 0 && places.length === 0,
    )
    const autoCompleteSuggestions = useMemo(() => {
        if (debouncedPlaceSearchQuery.length > 0 && places.length === 0) {
            return _autoCompleteSuggestions?.predictions?.map(s => ({
                label: s.description,
                value: s.place_id,
                key: s.place_id,
            }))
        }
        return []
    }, [_autoCompleteSuggestions, places, debouncedPlaceSearchQuery])

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '5px',
                padding: '15px',
                position: 'relative',
                height: '100%',
                overflow: 'clip',
                width: '100%',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    width: '49%',
                }}
            >
                {places.map((p, idx) => (
                    <PlaceCard
                        key={p.place_id}
                        place={p}
                        userPlaceInfo={userPlaceInfoByPlaceId?.[p.place_id] ?? null}
                        showSave={false}
                    />
                ))}
            </div>
            <div style={{ width: '49%', height: '500px', position: 'sticky', top: '80px' }}>
                <AutoComplete
                    autoFocus
                    placeholder="Search..."
                    allowClear
                    onChange={q => {
                        setPlaceSearchQuery(q)
                    }}
                    style={{
                        width: '100%',
                        height: '32px',
                        fontSize: '20px',
                        padding: '5px',
                        marginBottom: '15px',
                    }}
                    value={placeSearchQuery}
                    onSelect={placeID => {
                        if (places.length) {
                            return
                        }
                        setSelectedPlaceID(placeID)
                    }}
                >
                    {(autoCompleteSuggestions ?? []).map(opt => (
                        <AutoComplete.Option key={opt.key} value={opt.value}>
                            {opt.label}
                        </AutoComplete.Option>
                    ))}
                </AutoComplete>
                {newPlaceDetails ? (
                    <PlaceCard
                        place={newPlaceDetails as PlaceAutocompleteResult}
                        userPlaceInfo={null}
                        showSave
                    />
                ) : null}
            </div>
        </div>
    )
}

export default Places
