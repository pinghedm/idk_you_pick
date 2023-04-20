import { useState } from 'react'
import { initializeApp } from 'firebase/app'
import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    connectAuthEmulator,
} from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const databaseUrl = process.env.REACT_APP_FIRESTORE_URL || ''
const firebaseConfig = {
    apiKey: 'AIzaSyCfsbLCkQdYMTlpgpLd9WRnbw0YXQx4Icw',
    authDomain: 'idkyoupick.firebaseapp.com',
    projectId: 'idkyoupick',
    storageBucket: 'idkyoupick.appspot.com',
    messagingSenderId: '480932222539',
    appId: '1:480932222539:web:9d5d004090bb98b5d45fce',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth()
const emulatorAuthDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || ''
if (emulatorAuthDomain.includes('localhost')) {
    connectAuthEmulator(auth, emulatorAuthDomain)
}
export const db = getFirestore(app)
if (databaseUrl.includes('localhost')) {
    connectFirestoreEmulator(
        db,
        databaseUrl.split('//')[1].split(':')[0],
        Number(databaseUrl.split(':').slice(-1).pop()),
    )
}

// auth
export const useCurrentUser = () => {
    const [curUser, setCurUser] = useState(auth.currentUser)
    onAuthStateChanged(auth, user => {
        if (user) {
            setCurUser(user)
        }
    })
    return curUser
}

export const loginUser = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password)
        return null
    } catch (error) {
        return error as { code: string; message: string }
    }
}

export const logout = async () => {
    await signOut(auth)
}
