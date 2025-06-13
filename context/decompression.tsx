// expo react stack
import React, { createContext, useContext, useEffect, useState } from 'react';

// third party stack
import AsyncStorage from '@react-native-async-storage/async-storage';

// context
import { usePlanner } from '@/context/planner';

interface Mixture {
  oxygen: number;
  nitrogen: number;
  helium: number;
  cylinders: Array<{
    waterCapacity: number;
    workingPressure: number;
  }>;
}

export interface Stop {
  startDepth: number;
  endDepth: number;
  timeSeconds: number;
  type: Array<'ascent' | 'descent' | 'stop' | 'deco'>;
}

export interface Compartment {
  saturation: number;
  mValue: number;
}

interface SaturationTick {
  diveTime: number;
  ambientPressure: number;
  depth: number;
  compartments: Array<Compartment>;
}

interface Preferences {
  gfLow: number;
  gfHigh: number;

  minimumDecoTime: number;
  minimumStepSize: number;
  lastStopDepth: number;

  ascentRate: number;
  descentRate: number;

  freshwater: boolean;

  mixtures: Array<Mixture>;
}

interface DecompressionProps {
  preferences?: Preferences;

  diveProfile?: Array<Stop>;
  decoProfile?: Array<Stop>;

  saturationTimeline?: Array<{
    diveTime: number;
    ambientPressure: number;
    depth: number;
    compartments: Compartment[];
  }>;

  setPreference?: <K extends keyof Preferences>(key: K, value: Preferences[K]) => any;
}

const defaultProps: DecompressionProps = {
  preferences: {
    gfHigh: 0.7,
    gfLow: 0.3,

    minimumDecoTime: 60,
    minimumStepSize: 3,
    lastStopDepth: 6,

    descentRate: 1,
    ascentRate: 0.15,

    freshwater: false,

    mixtures: [
      {
        oxygen: 0.21,
        nitrogen: 0.79,
        helium: 0.0,
        cylinders: [
          {
            waterCapacity: 12.2,
            workingPressure: 232.0,
          },
        ],
      },
    ],
  },

  diveProfile: [],
  decoProfile: [],
  saturationTimeline: [],
};

const DecompressionContext = createContext<DecompressionProps>({});

export const useDecompression = () => useContext(DecompressionContext);

export const DecompressionProvider = ({ children }: { children: React.ReactNode }) => {
  const { stopsUI } = usePlanner();

  const [preferences, setPreferences] = useState(defaultProps.preferences!);
  const [diveProfile, setDiveProfile] = useState<Stop[]>(defaultProps.diveProfile!);
  const [decoProfile, setDecoProfile] = useState<Stop[]>(defaultProps.decoProfile!);
  const [saturationTimeline, setSaturationTimeline] = useState<SaturationTick[]>(
    defaultProps.saturationTimeline!
  );

  useEffect(() => {
    let profile: Stop[] = [];

    stopsUI!.map((stop, i) => {
      profile.push({
        startDepth: stop.depthMetres,
        endDepth: stop.depthMetres,
        timeSeconds: stop.timeSeconds,
        type: ['stop'],
      });

      if (i < stopsUI!.length - 1) {
        const descent = stop.depthMetres < stopsUI![i + 1].depthMetres;

        const moveTime =
          Math.abs(stop.depthMetres - stopsUI![i + 1].depthMetres) /
          (descent ? preferences.descentRate : preferences.ascentRate);

        profile.push({
          startDepth: stop.depthMetres,
          endDepth: stopsUI![i + 1].depthMetres,
          timeSeconds: moveTime,
          type: descent ? ['descent'] : ['ascent'],
        });
      }
    });

    setDiveProfile(profile);
  }, [stopsUI]);

  useEffect(() => {
    if (diveProfile!.length > 0) saturationOverTime(diveProfile!);
  }, [diveProfile]);

  useEffect(() => {
    if (diveProfile!.length > 0) saturationOverTime(diveProfile!);
  }, [preferences]);

  useEffect(() => {
    //console.log(saturationTimeline);
  }, [saturationTimeline]);

  useEffect(() => {
    //console.log(decoProfile);
  }, [decoProfile]);

  const setPreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    if (value === undefined) throw new Error('Preference value is undefined');

    setPreferences((prev) => ({
      ...prev,
      [key]: value ?? defaultProps.preferences![key],
    }));
  };

  const saturationOverTime = (diveProfile: Stop[]) => {
    let diveTime = 0;
    let firstStop = true;
    let lastStop = false;
    let surfacePressure = depthToAbs(0, 0, preferences.freshwater!);
    let controlIndex = 0;
    let prevIndex = 0;

    let decoProfile: Stop[] = [];
    let saturationTimeline: SaturationTick[] = [];
    let compartments: Compartment[] = COMPARTMENT_DATA.map((compartment) => {
      return {
        saturation: surfacePressure * preferences.mixtures![0].nitrogen,
        mValue: getMValue(
          surfacePressure * preferences.mixtures![0].nitrogen,
          compartment.a,
          compartment.b
        ),
      };
    });

    let gfHigh =
          surfacePressure * preferences.mixtures[0].nitrogen +
          surfacePressure * preferences.mixtures[0].nitrogen * preferences.gfHigh;

    for (let index = 0; index < diveProfile.length + decoProfile.length; index++) {
      let stop =
        index + 1 > diveProfile.length
          ? decoProfile[index - diveProfile.length]
          : diveProfile[index];

      let distance = Math.abs(stop.startDepth - stop.endDepth);
      let speed = distance / stop.timeSeconds;
      let depth = stop.startDepth;
      let elapsed = 0;

      while (elapsed < stop.timeSeconds) {
        let tick = Math.min(stop.timeSeconds - elapsed, 1);

        if (stop.type.includes('ascent')) depth = stop.startDepth - elapsed * speed;
        if (stop.type.includes('descent')) depth = stop.startDepth + elapsed * speed;

        let ambientPressure = depthToAbs(depth, 0, preferences.freshwater!);

        controlIndex = getControlIndex(compartments);

        let gfLow = (ambientPressure - compartments[controlIndex].mValue) * preferences.gfLow;

        let gfLowDepth = Math.ceil(
          absToDepth(ambientPressure - gfLow, preferences.freshwater!)
        );

        compartments = COMPARTMENT_DATA.map((compartment, i) => {
          return {
            saturation: compartmentSaturation(
              compartments[i].saturation ?? preferences.mixtures[0].nitrogen * ambientPressure,
              ambientPressure * preferences.mixtures[0].nitrogen,
              tick / 60,
              compartment.halfTime
            ),
            mValue: getMValue(compartments[i].saturation, compartment.a, compartment.b),
          };
        });

        saturationTimeline.push({ depth, ambientPressure, compartments, diveTime });

        elapsed += tick;
        diveTime += tick;

        if (stop.type.includes('deco')) {
          if (stop.type.includes('ascent')) {
            if (elapsed >= stop.timeSeconds) {
              // continue ascending until we cant ascend further than a meter
              // accuracy of 1 meter on ascent, look in to later
              if (gfLowDepth <= depth - 1) {
                stop.timeSeconds = (stop.startDepth - gfLowDepth) / preferences.ascentRate;
                stop.endDepth = gfLowDepth;
              }
            }
          }
          if (stop.type.includes('stop')) {
            stop.timeSeconds += tick;
            if (elapsed >= preferences.minimumDecoTime) {
              if (gfLowDepth <= depth - preferences.minimumStepSize) break;
              if (gfHigh >= compartments[controlIndex].saturation) break;
              if (gfLowDepth <= preferences.lastStopDepth && lastStop === false) break;
              if (prevIndex !== controlIndex && lastStop === false) break;
              if (gfLowDepth <= 0 && lastStop === true) break;
            }
          }
        }
      }

      // if we've gone through all the 'dive' stops we need to start adding deco stops
      if (index + 1 === diveProfile.length + decoProfile.length) {
        if (stop.endDepth === 0) break;

        let ambientPressure = depthToAbs(stop.endDepth, 0, preferences.freshwater);

        let controlIndex = getControlIndex(compartments);

        let gfHigh =
          surfacePressure * preferences.mixtures[0].nitrogen +
          surfacePressure * preferences.mixtures[0].nitrogen * preferences.gfHigh;

        let gfLow = (ambientPressure - compartments[controlIndex].mValue) * preferences.gfLow;

        let gfLowDepth = Math.ceil(absToDepth(ambientPressure - gfLow, preferences.freshwater));

        let nextDepth = gfLowDepth;

        if (stop.type.includes('stop')) {
          if (gfHigh >= compartments[controlIndex].saturation) {
            if (!lastStop) {
              lastStop = true;
              nextDepth = preferences.lastStopDepth;
            } else nextDepth = 0;
          }

          if (gfLowDepth <= preferences.lastStopDepth) {
            if (!lastStop) {
              lastStop = true;
              nextDepth = preferences.lastStopDepth;
            } else nextDepth = 0;
          }

          if (firstStop) {
            nextDepth = gfLowDepth;
            firstStop = false;
          }

          decoProfile.push({
            startDepth: stop.endDepth,
            endDepth: nextDepth,
            timeSeconds: (stop.endDepth - nextDepth) / preferences.ascentRate,
            type: ['ascent', 'deco'],
          });
        } else if (stop.type.includes('ascent')) {
          decoProfile.push({
            startDepth: stop.endDepth,
            endDepth: stop.endDepth,
            timeSeconds: 1,
            type: ['stop', 'deco'],
          });
        }
      }
    }

    setSaturationTimeline(saturationTimeline);
    setDecoProfile(decoProfile);
  };

  const value = {
    preferences,
    diveProfile,
    decoProfile,
    saturationTimeline,
    setPreference,
  };

  return (
    <DecompressionContext.Provider value={value}>{children}</DecompressionContext.Provider>
  );
};

/*
  Pcomp           = Inert gas pressure in the compartment after the exposure time (ATM)
  Pbegin          = Inert gas pressure in the compartment before the exposure time (ATM)
  Pgas            = Inert gas pressure in the mixture being breathed (ATM)
  te              = Length of the exposure time (minutes)
  tht             = Half time of the compartment (minutes)

  Pcomp           = Pbegin + [ Pgas - Pbegin ] x [ 1 - 2 ^ ( - te / tht ) ] 
*/
const compartmentSaturation = (Pbegin: number, Pgas: number, te: number, tht: number): number =>
  Pbegin + (Pgas - Pbegin) * (1 - 2 ** (-te / tht));

/*
  P (t.tol) i.g.  = tolerated inert gas pressure (absolute) in hypothetical "tissue" compartment
  P (t) i.g.      = inert gas pressure (absolute) in hypothetical "tissue" compartment
  P (amb)         = ambient pressure (absolute)
  P (amb.tol)     = tolerated ambient pressure (absolute)
  a               = intercept at zero ambient pressure (absolute)
  b               = reciprocal of slope of m-value Line

  amb             = ambient
  t               = tissue
  tol             = tolerated
  
  m-value x       = [P(t i.g) - a] * b
*/

const getControlIndex = (compartments: Array<Compartment>) => {
  let controlIndex = 0;
  for (let i = 0; i < compartments.length; i++) {
    if (compartments[i].mValue > compartments[controlIndex].mValue) {
      controlIndex = i;
    }
  }

  return controlIndex;
};

const getMValue = (Pt: number, a: number, b: number) => (Pt - a) * b;

const depthToAbs = (h: number, altitude: number, freshwater: boolean): number =>
  ((freshwater ? FRESHWATER_DENSITY : SEAWATER_DENSITY) * GRAVITY_FORCE * h) / 101325 + 1;

const absToDepth = (abs: number, freshwater: boolean): number =>
  ((abs - 1) * 101325) / ((freshwater ? FRESHWATER_DENSITY : SEAWATER_DENSITY) * GRAVITY_FORCE);

const GRAVITY_FORCE = 9.80665; // m/s²
const FRESHWATER_DENSITY = 997.0474; // kg/m³
const SEAWATER_DENSITY = 1023.6; // kg/m³

const COMPARTMENT_DATA = [
  { halfTime: 5.0, a: 1.1696, b: 0.5578 },
  { halfTime: 8.0, a: 1.0, b: 0.6514 },
  { halfTime: 12.5, a: 0.8618, b: 0.7222 },
  { halfTime: 18.5, a: 0.7562, b: 0.7825 },
  { halfTime: 27.0, a: 0.62, b: 0.8126 },
  { halfTime: 38.3, a: 0.5043, b: 0.8434 },
  { halfTime: 54.3, a: 0.441, b: 0.8693 },
  { halfTime: 77.0, a: 0.4, b: 0.891 },
  { halfTime: 109.0, a: 0.375, b: 0.9092 },
  { halfTime: 146.0, a: 0.35, b: 0.9222 },
  { halfTime: 187.0, a: 0.3295, b: 0.9319 },
  { halfTime: 239.0, a: 0.3065, b: 0.9403 },
  { halfTime: 305.0, a: 0.2835, b: 0.9477 },
  { halfTime: 390.0, a: 0.261, b: 0.9544 },
  { halfTime: 498.0, a: 0.248, b: 0.9602 },
  { halfTime: 635.0, a: 0.2327, b: 0.9653 },
];
