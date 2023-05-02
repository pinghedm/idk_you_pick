import React, { useState, useMemo } from 'react'
import { useUsers, User, useCurrentUserDetails } from 'services/user_service'
import { Typography, Button, Card, Radio } from 'antd'
import {
    useMultipleUserPlaceInfos,
    UserPlaceInfo,
    useMatchingPlaces,
    Place,
} from 'services/place_service'
import { ExportOutlined, StarOutlined, StarFilled } from '@ant-design/icons'
export interface FindPlaceProps {}
type AugmentedUserPlaceInfo = UserPlaceInfo & User
type AugmentedPlace = Place & {
    desireScore: number
    ratingScore: number
    userPlaceInfos: AugmentedUserPlaceInfo[]
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
    return (
        <div style={{ width: '100%', height: '100%', padding: '15px' }}>
            <Typography.Title level={3}>Find Me A Place!</Typography.Title>
            <Typography.Title level={4}>Who Is Around Tonight?</Typography.Title>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '10px',
                }}
            >
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
            </div>
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
                        {(matchingPlaces ?? []).map(place => (
                            <Card
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
                                        .sort((u1, u2) => u1.email.localeCompare(u2.email))
                                        .map(uip => (
                                            <div
                                                key={uip.email}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    gap: '5px',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {uip.name || uip.email}{' '}
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        gap: '1px',
                                                    }}
                                                >
                                                    {[1, 2, 3, 4, 5].map(rating => {
                                                        const score =
                                                            sortMode === 'desire'
                                                                ? uip.desire
                                                                : uip.rating
                                                        if (score === null || rating > score) {
                                                            return <StarOutlined key={rating} />
                                                        } else {
                                                            return <StarFilled key={rating} />
                                                        }
                                                    })}
                                                </div>
                                            </div>
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
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    )
}

export default FindPlace