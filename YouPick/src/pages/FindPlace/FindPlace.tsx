import React, { useState, useMemo } from 'react'
import { useUsers, User, useCurrentUserDetails } from 'services/user_service'
import { Typography, Button, Card, Radio, Input, Tag } from 'antd'
import {
    useMultipleUserPlaceInfos,
    UserPlaceInfo,
    useMatchingPlaces,
    Place,
} from 'services/place_service'
import { ExportOutlined, StarOutlined, StarFilled } from '@ant-design/icons'
import styled, { css } from 'styled-components'

export interface FindPlaceProps {}
type AugmentedUserPlaceInfo = UserPlaceInfo & User
type AugmentedPlace = Place & {
    desireScore: number
    ratingScore: number
    userPlaceInfos: AugmentedUserPlaceInfo[]
}
const MOBILE_BREAKPOINT = '500px'

const UserWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;

    @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
        flex-direction: row;
        flex-wrap: wrap;
    }
`

const LocationWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
        flex-direction: row;
        flex-wrap: wrap;
    }
`

const CardWrap = styled(Card)`
    width: 100%;
    & .ant-card-head-title {
        overflow: unset;
        white-space: unset;
    }
    @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
        width: 30%;
        min-width: 400px;
    }
`

const UserRatingRow = ({
    uip,
    sortMode,
    forceNoteOpen,
    forceTagsOpen,
}: {
    uip: AugmentedUserPlaceInfo
    sortMode: 'desire' | 'rating'
    forceNoteOpen: boolean
    forceTagsOpen: boolean
}) => {
    const [_notesOpen, setNotesOpen] = useState(false)
    const [_tagsOpen, setTagsOpen] = useState(false)
    const notesOpen = useMemo(() => _notesOpen || (forceNoteOpen && uip.notes), [
        forceNoteOpen,
        _notesOpen,
        uip.notes,
    ])
    const tagsOpen = useMemo(() => _tagsOpen || (forceTagsOpen && (uip?.tags?.length ?? 0) > 0), [
        forceTagsOpen,
        _tagsOpen,
        uip.tags,
    ])

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                        flexDirection: 'row',
                        gap: '5px',
                        alignItems: 'center',
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '1px',
                        }}
                    >
                        {[1, 2, 3, 4, 5].map(rating => {
                            const score = sortMode === 'desire' ? uip.desire : uip.rating
                            if (score === null || rating > score) {
                                return <StarOutlined key={rating} />
                            } else {
                                return <StarFilled key={rating} />
                            }
                        })}
                    </div>
                    {uip.name || uip.email || 'Unknown User'}{' '}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                    <Button
                        size="small"
                        disabled={!uip.notes}
                        onClick={() => {
                            setNotesOpen(!notesOpen)
                        }}
                    >
                        {notesOpen ? 'Hide' : 'Show'} Notes
                    </Button>
                    <Button
                        size="small"
                        disabled={(uip?.tags?.length ?? 0) === 0}
                        onClick={() => {
                            setTagsOpen(!tagsOpen)
                        }}
                    >
                        {tagsOpen ? 'Hide' : 'Show'} Tags
                    </Button>
                </div>
            </div>
            {tagsOpen ? (
                <div
                    style={{ display: 'flex', flexDirection: 'row', gap: '2px', flexWrap: 'wrap' }}
                >
                    {(uip?.tags ?? []).map(t => (
                        <Tag key={t}>{t}</Tag>
                    ))}
                </div>
            ) : null}
            {notesOpen ? <Input.TextArea readOnly value={uip.notes} /> : null}
        </div>
    )
}

const FindPlace = ({}: FindPlaceProps) => {
    const { data: currentUser } = useCurrentUserDetails()
    const { data: users } = useUsers()
    const userById: Record<string, User> = useMemo(
        () => (users ?? []).reduce((memo, next) => ({ ...memo, [next.id]: next }), {}),
        [users],
    )
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const { data: _matchingUserPlaceInfos } = useMultipleUserPlaceInfos(selectedUserIds)
    const matchingUserPlaceInfos = useMemo(() => {
        const placesById: Record<string, AugmentedUserPlaceInfo[]> = {}
        const hardNoPlaceIds = new Set<string>()
        ;(_matchingUserPlaceInfos ?? []).forEach(upi => {
            if (upi.hard_no) {
                hardNoPlaceIds.add(upi.place_id)
            }
            placesById[upi.place_id] = [
                ...(placesById?.[upi.place_id] ?? []),
                { ...upi, ...userById[upi.user_id] },
            ]
        })
        return Object.fromEntries(
            Object.entries(placesById).filter(([key, val]) => !hardNoPlaceIds.has(key)),
        )
    }, [_matchingUserPlaceInfos, userById])
    const { data: _matchingPlaces } = useMatchingPlaces(Object.keys(matchingUserPlaceInfos))
    const [sortMode, setSortMode] = useState<'desire' | 'rating'>('desire')
    const matchingPlaces = useMemo(() => {
        const places: AugmentedPlace[] = []
        ;(_matchingPlaces ?? []).forEach(p => {
            const place: AugmentedPlace = {
                ...p,
                desireScore:
                    matchingUserPlaceInfos[p.place_id]
                        .map(upi => upi.desire)
                        .reduce((memo, next) => memo || 0 + (next || 0), 0) || 0,
                ratingScore:
                    matchingUserPlaceInfos[p.place_id]
                        .map(upi => upi.rating)
                        .reduce((memo, next) => memo || 0 + (next || 0), 0) || 0,
                userPlaceInfos: matchingUserPlaceInfos[p.place_id],
            }
            places.push(place)
        })
        return places
            .sort((p1, p2) =>
                sortMode === 'desire'
                    ? p1.desireScore - p2.desireScore
                    : p1.ratingScore - p2.ratingScore,
            )
            .reverse()
    }, [matchingUserPlaceInfos, _matchingPlaces, sortMode])

    const [allNotesOpen, setAllNotesOpen] = useState(false)
    const [allTagsOpen, setAllTagsOpen] = useState(false)
    return (
        <div style={{ width: '100%', height: '100%', padding: '15px' }}>
            <Typography.Title level={3}>Find Me A Place!</Typography.Title>
            <Typography.Title level={4}>Who Is Around Tonight?</Typography.Title>
            <UserWrap>
                {(users ?? [])
                    .filter(u => u.id !== currentUser?.id)
                    .map(u => (
                        <Button
                            key={u.id}
                            style={{ fontSize: '24px', height: '50px' }}
                            type={selectedUserIds.includes(u.id) ? 'primary' : undefined}
                            onClick={() => {
                                if (selectedUserIds.includes(u.id)) {
                                    setSelectedUserIds(uids => uids.filter(id => id !== u.id))
                                } else {
                                    setSelectedUserIds(uids => [...uids, u.id])
                                }
                            }}
                        >
                            {u.name || u.email}
                        </Button>
                    ))}
            </UserWrap>
            <div style={{ fontSize: '24px', display: 'flex', flexDirection: 'row', gap: '5px' }}>
                Sort By:
                <Radio.Group
                    value={sortMode}
                    onChange={e => {
                        setSortMode(e.target.value)
                    }}
                >
                    <Radio style={{ fontSize: '24px' }} value={'desire'}>
                        Want To Go To
                    </Radio>
                    <Radio style={{ fontSize: '24px' }} value={'rating'}>
                        Have Enjoyed
                    </Radio>
                </Radio.Group>
            </div>

            {(matchingPlaces ?? []).length > 0 ? (
                <>
                    <Typography.Title level={4}>Results:</Typography.Title>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                        <Button
                            onClick={() => {
                                setAllNotesOpen(!allNotesOpen)
                            }}
                        >
                            {allNotesOpen ? 'Hide' : 'Show'} All Notes
                        </Button>
                        <Button
                            onClick={() => {
                                setAllTagsOpen(!allTagsOpen)
                            }}
                        >
                            {allTagsOpen ? 'Hide' : 'Show'} All Tags
                        </Button>
                    </div>
                    <LocationWrap>
                        {(matchingPlaces ?? []).map(place => (
                            <CardWrap
                                title={
                                    <div>
                                        {place.name} • {place.vicinity}
                                    </div>
                                }
                                key={place.place_id}
                            >
                                <div
                                    style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
                                >
                                    {place.userPlaceInfos
                                        .sort((u1, u2) =>
                                            (u1?.email ?? '').localeCompare(u2?.email ?? ''),
                                        )
                                        .map(uip => (
                                            <UserRatingRow
                                                uip={uip}
                                                sortMode={sortMode}
                                                key={uip.id}
                                                forceNoteOpen={allNotesOpen}
                                                forceTagsOpen={allTagsOpen}
                                            />
                                        ))}
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            gap: '5px',
                                        }}
                                    >
                                        <Button
                                            href={place.website}
                                            target="_blank"
                                            style={{ color: 'blue' }}
                                        >
                                            View Website
                                            <ExportOutlined />
                                        </Button>
                                        <Button
                                            href={place.url}
                                            target="_blank"
                                            style={{ color: 'blue' }}
                                        >
                                            View In Google Maps
                                            <ExportOutlined />
                                        </Button>
                                    </div>
                                    <Typography.Text type="secondary">
                                        Added By:{' '}
                                        {userById?.[place.addedBy ?? '']?.name ||
                                            userById?.[place.addedBy ?? '']?.email ||
                                            'Unknown User'}
                                    </Typography.Text>
                                </div>
                            </CardWrap>
                        ))}
                    </LocationWrap>
                </>
            ) : null}
        </div>
    )
}

export default FindPlace
