// expo react stack
import React, { createContext, useContext, useEffect, useState } from 'react';

// third party stack
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StopUI {
  depthMetres: number;
  timeSeconds: number;
}

interface PlannerProps {
  stopsUI?: StopUI[];
  setStopsUI?: React.Dispatch<React.SetStateAction<StopUI[]>>;
}

const defaultProps: PlannerProps = {
  stopsUI: [
    {
      depthMetres: 0.0,
      timeSeconds: 0.0,
    },
    {
      depthMetres: 60.0,
      timeSeconds: 1200.0,
    }
  ],
};

const PlannerContext = createContext<PlannerProps>({});

export const usePlanner = () => useContext(PlannerContext);

export const PlannerProvider = ({ children }: { children: React.ReactNode }) => {
  const [stopsUI, setStopsUI] = useState<StopUI[]>(defaultProps.stopsUI!);

  const value = {
    stopsUI,
    setStopsUI
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
};
