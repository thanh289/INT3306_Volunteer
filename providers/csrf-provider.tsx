'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

type CsrfContextType = {
    csrfToken: string | null;
    isLoading: boolean;
};

const CsrfContext = createContext<CsrfContextType>({
    csrfToken: null,    // save raw token
    isLoading: true,
});

export const useCsrf = () => useContext(CsrfContext);

type CsrfProviderProps = {
    children: ReactNode;
};

export const CsrfProvider = ({ children }: CsrfProviderProps) => {
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const response = await axios.get('/api/csrf-token');
                setCsrfToken(response.data.csrfToken);
            } catch (error) {
                console.error('Failed to fetch CSRF token:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCsrfToken();
    }, []);

    return (
        <CsrfContext.Provider value={{ csrfToken, isLoading }}>
            {children}
        </CsrfContext.Provider>
    );
};