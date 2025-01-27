import React, { createContext, useContext } from 'react';

type WidgetContextType = {
  agent_id: string;
  schema: string;
  access_token: string;
};

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const useWidgetContext = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgetContext must be used within a WidgetProvider');
  }
  return context;
};

type WidgetProviderProps = {
  children: React.ReactNode;
  agent_id: string;
  schema: string;
  access_token: string; // Added access_token to props
};

export const WidgetProvider: React.FC<WidgetProviderProps> = ({
  children,
  agent_id,
  schema,
  access_token, // Destructure access_token
}) => {
  return (
    <WidgetContext.Provider value={{ agent_id, schema, access_token }}>
      {children}
    </WidgetContext.Provider>
  );
};
