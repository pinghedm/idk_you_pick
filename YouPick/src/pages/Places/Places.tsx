import React, { useState, useMemo } from 'react'
import {
    PlaceAutocompleteResult,
    useAutocompleteSuggestions,
    usePlaceDetails,
} from 'services/map_service'
import {
    Card,
    Button,
    Switch,
    AutoComplete,
    Input,
    Typography,
    Tooltip,
    Checkbox,
    Tag,
    Select,
} from 'antd'
import {
    ExportOutlined,
    StarFilled,
    StarOutlined,
    DeleteOutlined,
    InfoCircleFilled,
} from '@ant-design/icons'
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
import { useUsers, User } from 'services/user_service'
import { shootConfetti } from 'services/utils'

export interface PlacesProps {}

const PlaceCard = ({
    place,
    userPlaceInfo,
    showSave,
    clearSearch,
    allTags,
}: {
    place: Place
    userPlaceInfo: UserPlaceInfo | null
    showSave: boolean
    clearSearch?: () => void
    allTags: Set<string>
}) => {
    const createPlaceMutation = useCreatePlace()
    const useCreateUserPlaceInfoMutation = useCreateUserPlaceInfo()
    const updateUserPlaceInfoMutation = useUpdateUserPlaceInfo()
    const [newPlaceInfo, setNewPlaceInfo] = useState<Omit<UserPlaceInfo, 'user_id' | 'place_id'>>({
        desire: userPlaceInfo?.desire ?? null,
        rating: userPlaceInfo?.rating ?? null,
        hard_no: userPlaceInfo?.hard_no ?? false,
        notes: userPlaceInfo?.notes ?? '',
        tags: userPlaceInfo?.tags ?? [],
    })
    const { data: users } = useUsers()
    const userById: Record<string, User> = useMemo(
        () => (users ?? []).reduce((memo, next) => ({ ...memo, [next.id]: next }), {}),
        [users],
    )
    const [newTag, setNewTag] = useState('')
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
                {newPlaceInfo?.hard_no ? (
                    <HardNo
                        hardNo={newPlaceInfo.hard_no}
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
                        {newPlaceInfo?.rating && !showSave ? null : (
                            <Rating
                                label="Interest"
                                helpText="How interested are you in visiting this place, if you haven't been?"
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
                        )}
                        <Rating
                            label="Rating"
                            helpText="How happy would you be to go to this place again, if you have been?"
                            currentRating={newPlaceInfo.rating}
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
                        {!showSave && (userPlaceInfo?.rating || userPlaceInfo?.desire) ? null : (
                            <HardNo
                                hardNo={newPlaceInfo.hard_no}
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
                        )}
                    </div>
                )}
            </div>
            {!showSave ? (
                <Typography.Text type="secondary">
                    Added By:{' '}
                    {userById?.[place.addedBy ?? '']?.name ||
                        userById?.[place.addedBy ?? '']?.email ||
                        'Unknown User'}
                </Typography.Text>
            ) : null}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    marginTop: '5px',
                    marginBottom: '5px',
                }}
            >
                <div
                    style={{ display: 'flex', flexDirection: 'row', gap: '2px', flexWrap: 'wrap' }}
                >
                    {(newPlaceInfo?.tags ?? []).map(t => (
                        <Tag
                            key={t}
                            closable
                            onClose={() => {
                                const newTags = (userPlaceInfo?.tags ?? []).filter(t_ => t_ !== t)
                                setNewPlaceInfo(pi => ({
                                    ...pi,
                                    tags: newTags,
                                }))
                                if (!showSave) {
                                    updateUserPlaceInfoMutation.mutate({
                                        ...newPlaceInfo,
                                        tags: newTags,
                                        place_id: place.place_id,
                                    })
                                }
                            }}
                        >
                            {t}
                        </Tag>
                    ))}
                </div>
                <AutoComplete
                    filterOption
                    style={{ width: '200px' }}
                    placeholder="New Tag"
                    allowClear
                    value={newTag}
                    onChange={val => {
                        setNewTag(val)
                    }}
                    options={Array.from(allTags).map(t => ({ value: t }))}
                    onSelect={val => {
                        setNewTag('')
                        if (!newPlaceInfo?.tags?.includes(val)) {
                            const newTags = [...(newPlaceInfo?.tags ?? []), val]
                            setNewPlaceInfo(pi => ({ ...pi, tags: newTags }))

                            if (!showSave) {
                                updateUserPlaceInfoMutation.mutate({
                                    ...newPlaceInfo,
                                    tags: newTags,
                                    place_id: place.place_id,
                                })
                            }
                        }
                    }}
                    onKeyUp={e => {
                        if (e.key === 'Enter') {
                            if (!newPlaceInfo?.tags?.includes(newTag)) {
                                const newTags = [...(newPlaceInfo?.tags ?? []), newTag]
                                setNewPlaceInfo(pi => ({
                                    ...pi,
                                    tags: newTags,
                                }))
                                if (!showSave) {
                                    updateUserPlaceInfoMutation.mutate({
                                        ...newPlaceInfo,
                                        tags: newTags,
                                        place_id: place.place_id,
                                    })
                                }
                            }
                            setNewTag('')
                        }
                    }}
                />
            </div>
            <Input.TextArea
                placeholder="Notes"
                value={newPlaceInfo.notes}
                onChange={e => {
                    setNewPlaceInfo(pi => ({ ...pi, notes: e.target.value }))
                }}
                onBlur={e => {
                    if (!showSave) {
                        updateUserPlaceInfoMutation.mutate({
                            ...newPlaceInfo,
                            place_id: place.place_id,
                        })
                    }
                }}
            />
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
                                                shootConfetti()
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
    helpText,
}: {
    label: string
    currentRating: number | null
    onSelect: (newRating: number | null) => void
    helpText: string
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
            <Tooltip title={helpText}>
                <InfoCircleFilled style={{ fontSize: '14px' }} />
            </Tooltip>
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
        max-height: 500px;
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

    const allTags = useMemo(() => {
        const tags = new Set<string>()
        ;(userPlaceInfos ?? []).forEach(upi => {
            ;(upi?.tags ?? []).forEach(t => tags.add(t))
        })
        return tags
    }, [userPlaceInfos])

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
    const [placeFilters, setPlaceFilters] = useState<{
        hideRated: boolean
        hideDesired: boolean
        hideHardNo: boolean
        tags: string[]
    }>({ hideRated: false, hideDesired: false, hideHardNo: true, tags: [] })

    const filteredPlaces = useMemo(
        () =>
            places.filter(p => {
                const userPlaceInfo = userPlaceInfoByPlaceId?.[p.place_id]
                const passHardNo = !((userPlaceInfo?.hard_no ?? false) && placeFilters.hideHardNo)
                const passRated = !(placeFilters.hideRated && userPlaceInfo?.rating)
                const passDesired = !(placeFilters.hideDesired && userPlaceInfo?.desire)
                const passTags =
                    !placeFilters.tags.length ||
                    placeFilters.tags.some(tag => (userPlaceInfo?.tags ?? []).includes(tag))
                return passHardNo && passRated && passDesired && passTags
            }),
        [places, placeFilters, userPlaceInfoByPlaceId],
    )

    return (
        <PlaceWrap>
            <PlaceSearchWrap>
                <style>{`.ensureHeight {max-height: 175px;}`}</style>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                            <Checkbox
                                checked={placeFilters.hideRated}
                                onChange={e => {
                                    setPlaceFilters(pf => ({ ...pf, hideRated: e.target.checked }))
                                }}
                            />
                            <div style={{ color: 'black' }}>Hide Places I Have Been</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                            <Checkbox
                                checked={placeFilters.hideDesired}
                                onChange={e => {
                                    setPlaceFilters(pf => ({
                                        ...pf,
                                        hideDesired: e.target.checked,
                                    }))
                                }}
                            />
                            <div style={{ color: 'black' }}>Hide Places I Want To Go</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                            <Checkbox
                                checked={placeFilters.hideHardNo}
                                onChange={e => {
                                    setPlaceFilters(pf => ({ ...pf, hideHardNo: e.target.checked }))
                                }}
                            />
                            <div style={{ color: 'black' }}>Hide My Hard Nos</div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '5px',
                                alignItems: 'center',
                            }}
                        >
                            Filter By Tags:
                            <Select
                                style={{ flex: 1 }}
                                value={placeFilters.tags}
                                placeholder="Filter By Tag"
                                mode="multiple"
                                allowClear
                                showSearch
                                options={Array.from(allTags).map(t => ({
                                    value: t,
                                    key: t,
                                    label: t,
                                }))}
                                onChange={tags => {
                                    setPlaceFilters(pf => ({ ...pf, tags: tags }))
                                }}
                                showArrow
                                maxTagCount="responsive"
                                dropdownMatchSelectWidth={false}
                            />
                        </div>
                    </div>
                </div>

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
                        allTags={allTags}
                    />
                ) : null}
                {debouncedPlaceSearchQuery.length > 0 && places.length === 0 && !selectedPlaceID ? (
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
                {places.length !== filteredPlaces.length ? (
                    <Typography.Text type="secondary">
                        {places.length - filteredPlaces.length} Results Filtered Out
                    </Typography.Text>
                ) : null}
                {filteredPlaces.map((p, idx) => (
                    <PlaceCard
                        key={p.place_id}
                        place={p}
                        userPlaceInfo={userPlaceInfoByPlaceId?.[p.place_id] ?? null}
                        showSave={false}
                        allTags={allTags}
                    />
                ))}
            </PlaceListWrap>
        </PlaceWrap>
    )
}

export default Places
