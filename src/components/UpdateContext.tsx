import React, {createContext, useState} from 'react';

export const UpdateContext = createContext({
    downloadProgress: 0,
    setDownloadProgress: (progress: number) => {
    },
});

export const UpdateProvider = ({children}) => {
    const [downloadProgress, setDownloadProgress] = useState(0);

    return (
        <UpdateContext.Provider value={{downloadProgress, setDownloadProgress}}>
            {children}
        </UpdateContext.Provider>
    );
};
