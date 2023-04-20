import { useQuery, useMutation, useQueryClient } from 'react-query'
import { db, auth } from 'services/firebase'
import {
    doc,
    getDoc,
    setDoc,
    getDocs,
    collection,
    query as firebaseQuery,
} from 'firebase/firestore'
import { PlaceAutocompleteResult } from 'services/map_service'

export type Place = PlaceAutocompleteResult

export interface UserPlaceInfo {
    user_id: string
    place_id: string
    desire: number | null
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

export const useUserPlaceInfos = () => {
    const authUser = auth.currentUser
    const _get = async () => {
        if (authUser === null) {
            throw Error('Not Logged In')
        }
        const ref = collection(db, `users/${authUser.uid}/places`)
        const q = firebaseQuery(ref)
        const queryResult = await getDocs(q)
        const userPlaceInfos: UserPlaceInfo[] = []
        queryResult.forEach(d => userPlaceInfos.push(d.data() as UserPlaceInfo))
        return userPlaceInfos
    }
    const query = useQuery(['userPlaces', authUser?.uid], _get)
    return query
}

export const useCreateUserPlaceInfo = () => {
    const authUser = auth.currentUser
    const _post = async (place_id: string) => {
        if (!authUser) {
            throw Error('Not Logged In')
        }
        const ref = doc(db, `users/${authUser.uid}/places/${place_id}`)
        await setDoc(ref, { desire: null })
        return { user_id: authUser.uid, place_id, desire: null } as UserPlaceInfo
    }
    const queryClient = useQueryClient()
    const mutation = useMutation((place_id: string) => _post(place_id), {
        onMutate: async () => {
            await queryClient.cancelQueries(['userPlaces', authUser?.uid])
        },
        onSettled: () => {
            queryClient.invalidateQueries(['userPlaces', authUser?.uid])
        },
    })
    return mutation
}
