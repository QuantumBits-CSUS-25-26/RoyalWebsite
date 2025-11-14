import React, {createContext, useContext, useState } from 'react';

const UiContext = createContext();

export function UiProvider ({children}) {
    const [servicesOpen, setServiceOpen] = useState(false);

    return(
        <UiContext.Provider value={{servicesOpen, setServiceOpen}}>
            {children}
        </UiContext.Provider>
    );
}
export function useUi(){
    return useContext(UiContext);
}