import React, { useState, useMemo } from 'react'
import {
    PlaceAutocompleteResult,
    useAutocompleteSuggestions,
    usePlaceDetails,
} from 'services/map_service'
import { Card, Button, Switch, AutoComplete, Input } from 'antd'
import { ExportOutlined, StarFilled, StarOutlined, DeleteOutlined } from '@ant-design/icons'
import {
    usePlaces,
    Place,
    useMyUserPlaceInfos,
    useCreateUserPlaceInfo,
    useCreatePlace,
    UserPlaceInfo,
    useUpdateUserPlaceInfo,
} from 'services/place_service'
import useDebounce from 'hooks/useDebounce'
import styled, { css } from 'styled-components'
import { v4 as uuidv4 } from 'uuid'

export interface PlacesProps {}

const PlaceCard = ({
    place,
    userPlaceInfo,
    showSave,
    clearSearch,
}: {
    place: Place
    userPlaceInfo: UserPlaceInfo | null
    showSave: boolean
    clearSearch?: () => void
}) => {
    const createPlaceMutation = useCreatePlace()
    const useCreateUserPlaceInfoMutation = useCreateUserPlaceInfo()
    const updateUserPlaceInfoMutation = useUpdateUserPlaceInfo()
    const [newPlaceInfo, setNewPlaceInfo] = useState<Omit<UserPlaceInfo, 'user_id' | 'place_id'>>({
        desire: null,
        rating: null,
        hard_no: false,
    })
    return (
        <Card
            title={
                <div>
                    {place.name} • {place?.vicinity ?? ''}
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
                    {place.website ? (
                        <Button href={place.website} target="_blank" style={{ color: 'blue' }}>
                            View Website
                            <ExportOutlined />
                        </Button>
                    ) : null}
                    {place.url ? (
                        <Button href={place.url} target="_blank" style={{ color: 'blue' }}>
                            View In Google Maps
                            <ExportOutlined />
                        </Button>
                    ) : null}
                </div>
                {userPlaceInfo?.hard_no ? (
                    <HardNo
                        hardNo={showSave ? newPlaceInfo.hard_no : userPlaceInfo?.hard_no ?? false}
                        onChange={hardNo => {
                            const newPlaceInfo_ = { ...newPlaceInfo, hard_no: hardNo }
                            setNewPlaceInfo(newPlaceInfo_)
                            if (!showSave) {
                                updateUserPlaceInfoMutation.mutate({
                                    ...newPlaceInfo_,
                                    place_id: place.place_id,
                                })
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
                                const newPlaceInfo_ = { ...newPlaceInfo, desire: newDesire }
                                setNewPlaceInfo(newPlaceInfo_)
                                if (!showSave) {
                                    updateUserPlaceInfoMutation.mutate({
                                        ...newPlaceInfo_,
                                        place_id: place.place_id,
                                    })
                                }
                            }}
                        />
                        <Rating
                            label="Rating"
                            currentRating={
                                showSave ? newPlaceInfo.rating : userPlaceInfo?.rating ?? null
                            }
                            onSelect={newRating => {
                                const newPlaceInfo_ = { ...newPlaceInfo, rating: newRating }
                                setNewPlaceInfo(newPlaceInfo_)
                                if (!showSave) {
                                    updateUserPlaceInfoMutation.mutate({
                                        ...newPlaceInfo_,
                                        place_id: place.place_id,
                                    })
                                }
                            }}
                        />
                        <HardNo
                            hardNo={
                                showSave ? newPlaceInfo.hard_no : userPlaceInfo?.hard_no ?? false
                            }
                            onChange={hardNo => {
                                const newPlaceInfo_ = { ...newPlaceInfo, hard_no: hardNo }
                                setNewPlaceInfo(newPlaceInfo_)
                                if (!showSave) {
                                    updateUserPlaceInfoMutation.mutate({
                                        ...newPlaceInfo_,
                                        place_id: place.place_id,
                                    })
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
                            createPlaceMutation.mutate(place, {
                                onSuccess: () => {
                                    useCreateUserPlaceInfoMutation.mutate(
                                        {
                                            ...newPlaceInfo,
                                            place_id: place.place_id,
                                        } as Omit<UserPlaceInfo, 'user_id'>,
                                        {
                                            onSettled: () => {
                                                ;(clearSearch ?? (() => {}))()
                                            },
                                        },
                                    )
                                },
                            })
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

const MOBILE_BREAKPOINT = '500px'

const PlaceWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 15px;
    position: relative;
    height: 100%;
    overflow: clip;
    width: 100%;

    @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
        flex-direction: row;
    }
`

const PlaceSearchWrap = styled.div`
    height: 30%;
    width: 100%;
    position: sticky;
    top: 80px;
    z-index: 2;
    background-color: white;
    @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
        width: 49%;
        height: 500px;
    }
`

const PlaceListWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    height: 60%;
    width: 100%;
    @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
        width: 49%;
    }
`

const Places = ({}: PlacesProps) => {
    const { data: _places } = usePlaces()
    const { data: userPlaceInfos } = useMyUserPlaceInfos()
    const userPlaceInfoByPlaceId = useMemo(
        () =>
            (userPlaceInfos ?? []).reduce(
                (memo, next) => ({ ...memo, [next.place_id]: next }),
                {} as Record<string, UserPlaceInfo>,
            ),
        [userPlaceInfos],
    )

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

    const [autoCompleteDropDownIsOpen, setautoCompleteDropDownIsOpen] = useState(false)
    const createPlaceMutation = useCreatePlace()
    const [manualPlace, setManualPlace] = useState<Partial<Place>>({})

    return (
        <PlaceWrap>
            <PlaceSearchWrap>
                <style>{`.ensureHeight{max-height: 175px;}`}</style>

                <AutoComplete
                    popupClassName={'ensureHeight'}
                    onDropdownVisibleChange={open => {
                        setautoCompleteDropDownIsOpen(open)
                    }}
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
                        clearSearch={() => {
                            setPlaceSearchQuery('')
                            setSelectedPlaceID(undefined)
                        }}
                    />
                ) : null}
                {debouncedPlaceSearchQuery.length > 0 && places.length === 0 ? (
                    <Card
                        title="Add Manually"
                        style={{ marginTop: autoCompleteDropDownIsOpen ? '150px' : undefined }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px',
                                alignItems: 'center',
                            }}
                        >
                            <Input
                                placeholder="Name"
                                value={manualPlace.name}
                                onChange={e => {
                                    setManualPlace(p => ({ ...p, name: e.target.value }))
                                }}
                            />
                            <Input
                                placeholder="Street Address"
                                value={manualPlace.vicinity}
                                onChange={e => {
                                    setManualPlace(p => ({ ...p, vicinity: e.target.value }))
                                }}
                            />
                            <Input
                                placeholder="Website URL"
                                value={manualPlace.website}
                                onChange={e => {
                                    setManualPlace(p => ({ ...p, website: e.target.value }))
                                }}
                            />
                            <Input
                                placeholder="Google Maps URL"
                                value={manualPlace.url}
                                onChange={e => {
                                    setManualPlace(p => ({ ...p, url: e.target.value }))
                                }}
                            />
                            <Button
                                style={{ alignSelf: 'flex-end' }}
                                disabled={!manualPlace.name}
                                type="primary"
                                onClick={() => {
                                    if (manualPlace.name !== undefined) {
                                        createPlaceMutation.mutate(
                                            {
                                                ...manualPlace,
                                                name: manualPlace.name,
                                                place_id: uuidv4(),
                                            },
                                            {
                                                onSettled: () => {
                                                    setManualPlace({})
                                                },
                                            },
                                        )
                                    }
                                }}
                            >
                                Create
                            </Button>
                        </div>
                    </Card>
                ) : null}
            </PlaceSearchWrap>
            <PlaceListWrap>
                {places.map((p, idx) => (
                    <PlaceCard
                        key={p.place_id}
                        place={p}
                        userPlaceInfo={userPlaceInfoByPlaceId?.[p.place_id] ?? null}
                        showSave={false}
                    />
                ))}
            </PlaceListWrap>
        </PlaceWrap>
    )
}

export default Places
