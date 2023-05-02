import { useQuery, useMutation, useQueryClient } from 'react-query'
import { db, useCurrentUser } from 'services/firebase'
import {
    doc,
    getDoc,
    setDoc,
    getDocs,
    collection,
    query as firebaseQuery,
    where,
} from 'firebase/firestore'
import { PlaceAutocompleteResult } from 'services/map_service'

export type Place = Omit<PlaceAutocompleteResult, 'vicinity' | 'url' | 'website'> & {
    vicinity?: string
    url?: string
    website?: string
    addedBy?: string
}

export interface UserPlaceInfo {
    user_id: string
    place_id: string
    desire: number | null
    rating: number | null
    hard_no: boolean
}

export const usePlaces = () => {
    // TODO: paginate?
    const _get = async () => {
        const ref = collection(db, 'places')
        const q = firebaseQuery(ref)
        const queryResult = await getDocs(q)
        const places: Place[] = []
        queryResult.forEach(d => places.push(d.data() as Place))
        return places
    }
    const query = useQuery(['places'], _get)
    return query
}

export const useMatchingPlaces = (placeIds: string[]) => {
    const _get = async (placeIds: string[]) => {
        const ref = collection(db, 'places')
        const q = firebaseQuery(ref, where('place_id', 'in', placeIds))
        const places: Place[] = []
        const queryResult = await getDocs(q)
        queryResult.forEach(d => places.push(d.data() as Place))
        return places
    }
    const query = useQuery(['places', placeIds.sort()], () => _get(placeIds), {
        enabled: placeIds.length > 0,
    })
    return query
}

export const useCreatePlace = () => {
    const _post = async (place: Place) => {
        const ref = doc(db, 'places/' + place.place_id)
        await setDoc(ref, place)
        return place
    }
    const queryClient = useQueryClient()
    const mutation = useMutation((place: Place) => _post(place), {
        onMutate: async () => {
            await queryClient.cancelQueries(['places'])
        },
        onSettled: () => {
            queryClient.invalidateQueries(['places'])
        },
    })
    return mutation
}

export const useMyUserPlaceInfos = () => {
    const authUser = useCurrentUser()
    const _get = async () => {
        if (!authUser) {
            throw Error('Not Logged In')
        }
        const ref = collection(db, `users/${authUser.uid}/places`)
        const q = firebaseQuery(ref)
        const queryResult = await getDocs(q)
        const userPlaceInfos: UserPlaceInfo[] = []
        queryResult.forEach(d => userPlaceInfos.push(d.data() as UserPlaceInfo))
        return userPlaceInfos
    }
    const query = useQuery(['userPlaces', authUser?.uid], _get, { enabled: !!authUser })
    return query
}

export const useUpdateUserPlaceInfo = () => {
    const authUser = useCurrentUser()
    const _post = async (updatedUserPlaceInfo: Omit<UserPlaceInfo, 'user_id'>) => {
        if (!authUser) {
            throw Error('Not Logged In')
        }
        const ref = doc(db, `users/${authUser.uid}/places/${updatedUserPlaceInfo.place_id}`)
        const updatedUserPlaceInfo_ = { ...updatedUserPlaceInfo, user_id: authUser.uid }
        await setDoc(ref, updatedUserPlaceInfo_)
        return updatedUserPlaceInfo_
    }
    const queryClient = useQueryClient()
    const mutation = useMutation(
        (updatedUserPlaceInfo: Omit<UserPlaceInfo, 'user_id'>) => _post(updatedUserPlaceInfo),
        {
            onMutate: async () => {
                await queryClient.cancelQueries(['userPlaces', authUser?.uid])
            },
            onSettled: () => {
                queryClient.invalidateQueries(['userPlaces', authUser?.uid])
            },
        },
    )
    return mutation
}

export const useCreateUserPlaceInfo = () => {
    const authUser = useCurrentUser()
    const _post = async (userPlaceInfo: Omit<UserPlaceInfo, 'user_id'>) => {
        if (!authUser) {
            throw Error('Not Logged In')
        }
        const newUserPlaceInfo = {
            desire: userPlaceInfo.desire,
            rating: userPlaceInfo.rating,
            hard_no: userPlaceInfo.hard_no,
            user_id: authUser.uid,
            place_id: userPlaceInfo.place_id,
        }
        const ref = doc(db, `users/${authUser.uid}/places/${userPlaceInfo.place_id}`)
        await setDoc(ref, newUserPlaceInfo)
        return newUserPlaceInfo
    }
    const queryClient = useQueryClient()
    const mutation = useMutation(
        (userPlaceInfo: Omit<UserPlaceInfo, 'user_id'>) => _post(userPlaceInfo),
        {
            onMutate: async () => {
                await queryClient.cancelQueries(['userPlaces', authUser?.uid])
                await queryClient.cancelQueries(['places'])
            },
            onSettled: () => {
                queryClient.invalidateQueries(['userPlaces', authUser?.uid])
                queryClient.invalidateQueries(['places'])
            },
        },
    )
    return mutation
}

export const useMultipleUserPlaceInfos = (userIds: string[]) => {
    const authUser = useCurrentUser()
    const _get = async (_userIds: string[]) => {
        if (!authUser) {
            return []
        }
        const places: UserPlaceInfo[] = []
        const userIds = [..._userIds, authUser.uid]
        for (let userId of userIds) {
            const ref = collection(db, `users/${userId}/places`)
            const q = firebaseQuery(ref)
            const queryResult = await getDocs(q)
            queryResult.forEach(upi => places.push(upi.data() as UserPlaceInfo))
        }
        return places
    }
    const query = useQuery(['findPlaces', userIds.sort()], () => _get(userIds), {
        enabled: userIds.length > 0,
    })
    return query
}
