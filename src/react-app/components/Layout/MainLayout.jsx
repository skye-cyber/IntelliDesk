import React from 'react';

export const MainLayout = ({ children }) => {
    return (
        <div className="h-screen w-screen overflow-hidden">
        {children}
        </div>
    );
};
