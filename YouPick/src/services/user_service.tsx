import { useQuery, useMutation, useQueryClient } from 'react-query'
import { db, useCurrentUser } from 'services/firebase'
import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    query as firebaseQuery,
} from 'firebase/firestore'

export interface User {
    id: string
    name: string
    email: string
    friend_ids: string[]
}

export const useCurrentUserDetails = () => {
    const authUser = useCurrentUser()

    const _get = async () => {
        if (!authUser) {
            return null
        }
        const ref = doc(db, 'users/' + authUser.uid)
        const userDetailsLazy = await getDoc(ref)
        const userDetails = userDetailsLazy.data() as User
        return { ...userDetails, email: authUser.email }
    }
    const query = useQuery(['user', 'self'], _get, { enabled: !!authUser })
    return query
}

export const useUpdateCurrentUser = () => {
    const authUser = useCurrentUser()
    const _post = async (userPatch: Partial<User>) => {
        if (!authUser) {
            return null
        }
        const updatedUser = { ...user, ...userPatch, email: authUser.email }
        const ref = doc(db, 'users/' + authUser.uid)
        await setDoc(ref, { id: ref.id, ...updatedUser })
        return updatedUser
    }
    const { data: user } = useCurrentUserDetails()
    const queryClient = useQueryClient()
    const mutation = useMutation((patch: Partial<User>) => _post(patch), {
        onMutate: async () => {
            await queryClient.cancelQueries(['user', 'self'])
        },
        onSettled: () => {
            queryClient.invalidateQueries(['user', 'self'])
        },
    })
    return mutation
}

export const useUsers = () => {
    const _get = async () => {
        const ref = collection(db, 'users')
        const q = firebaseQuery(ref)
        const queryResult = await getDocs(q)
        const users: User[] = []
        queryResult.forEach(d => users.push(d.data() as User))
        return users
    }
    const query = useQuery(['user', 'all'], _get)
    return query
}
