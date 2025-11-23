import React, {createContext, useContext, useState, useRef } from 'react';

const UiContext = createContext();

export function UiProvider ({children}) {
    const [servicesOpen, setServiceOpen] = useState(false);
    const closeTimerRef = useRef(null);

    const openServices = () => {
        if(closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
        setServiceOpen(true);
    };

    const scheduleCloseServices = () => {
        if(closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
        }
        closeTimerRef.current = setTimeout(() => {
            setServiceOpen(false);
            closeTimerRef.current = null;
        }, 180);
    };

    return(
        <UiContext.Provider value={{servicesOpen, setServiceOpen, scheduleCloseServices, openServices}}>
            {children}
        </UiContext.Provider>
    );
}
export function useUi(){
    return useContext(UiContext);
}