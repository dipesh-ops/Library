import React, { useState } from 'react'
import { toast } from 'react-toastify'
import {auth, fireDB} from "../firebase/FirebaseConfig"
import { addDoc, collection } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'

const Signup = () => {
    const navigate = useNavigate();
    const [createUser, setCreateUser] = useState({
        name : "",
        email : "",
        password : "",
        role : "user"
    })

    const signUpUser = async () =>{
        if(createUser.name == "" || createUser.email == "" || createUser.password == ""){
            return toast.info("Please fill all the fields");
        }
        try {
            const users = await createUserWithEmailAndPassword(auth, createUser.email, createUser.password);
            
            const user = {
                name : createUser?.name,
                email : createUser?.email,
                password : createUser?.password,
                uid : (await users).user.uid,
                role : createUser?.role,
                date : new Date().toLocaleDateString('en-US',{
                    day : "2-digit",
                    month : "short",
                    year : "numeric"
                }),
                time : new Date().toLocaleTimeString('en-US',{
                    hour : "2-digit",
                    minute : "2-digit",
                    second : "2-digit"
                })
            }

            const userReference = collection(fireDB, "user");
            await addDoc(userReference, user);

            toast.success("User created successfully");
            navigate("/");
            setCreateUser({
                name : "",
                email : "",
                password : ""
            })

        } catch (error) {
            console.log(error);
            toast.error("Error while creating new user");
        }
    }
    
  return (
    <div className='w-full h-screen flex justify-center items-center'>
        <div className='flex flex-col w-[600px] bg-emerald-50 shadow-2xl border rounded-lg p-10'>
            <h2 className='font-bold text-3xl text-emerald-600 mb-8 text-center'>Sign Up</h2>

            <div className='flex flex-col gap-y-2'>
                <input value={createUser.name} onChange={(e)=> setCreateUser({...createUser, name : e.target.value})} className='p-3 border border-emerald-500 rounded-lg outline-0' type="text" placeholder='Full Name'/>
                <input onChange={(e)=> setCreateUser({...createUser, email : e.target.value})} value={createUser.email} className='p-3 border border-emerald-500 rounded-lg outline-0' type="text" placeholder='Email'/>
                <input value={createUser.password} onChange={(e)=> setCreateUser({...createUser, password : e.target.value})} className='p-3 border border-emerald-500 rounded-lg outline-0' type="password" placeholder='Password'/>
            </div>
            <button onClick={signUpUser} className='font-bold text-white p-3 mt-6 rounded-lg cursor-pointer bg-emerald-600 hover:bg-emerald-700 duration-200 mb-8'>Signup</button>

            <h1 className='text-gray-500 text-center'>Already have account ? <span onClick={()=> navigate("/login")} className='text-emerald-500 cursor-pointer'>Login</span></h1>
        </div>
    </div>
  )
}

export default Signup