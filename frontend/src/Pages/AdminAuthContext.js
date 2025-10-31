import { createContext, useContext, useState, useEffect } from "react";
//import {BASE_URL} from '../utils/constants';
import axios from 'axios';

const AdminAuthContext = createContext();

export const AuthProvider = ({children})=>{
    // state to track if user is logged in
    const [user,setUser] = useState(null);
    // state to track loading
    const [loading, setLoading] = useState(true);

    //check localStorage for existing user on app load
    useEffect(()=>{
        const storedUser = localStorage.getItem('user');
        if(storedUser){
            setUser(JSON.parse(storedUser));
        }
        // done checking
        setLoading(false); 
    },[]);

    // login function 

    // RW-72/RW-73

    //needs to end with
    // setUser(user)

    return (
        <AdminAuthContext.Provider value={{ login}}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
}
