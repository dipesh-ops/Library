import { addDoc, collection } from "firebase/firestore"
import { fireDB } from "../firebase/FirebaseConfig"

export const logActivity = async ({type, bookTitle, userName, category}) =>{
    await addDoc(collection(fireDB, "activity"),{ 
    type,
    bookTitle,
    userName,
    category,
    createdAt : new Date()
})
}