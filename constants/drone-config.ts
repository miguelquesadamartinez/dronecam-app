// Configuración de red del dron.
//
// La Raspberry Pi no tiene IP fija todavía: cambia según en qué casa esté
// (router distinto en cada sitio). En vez de editar index.tsx cada vez,
// cambia solo ACTIVE_LOCATION aquí abajo y toda la app (vídeo + comandos)
// usará la IP correcta.
//
// Cuando conectes la RPi en un sitio nuevo, mira su IP con:
//   hostname -I
// y añade/actualiza la entrada correspondiente en LOCATIONS.

export const LOCATIONS = {
  segur: '192.168.68.96',
  barcelona: '192.168.0.102',
} as const;

export type LocationKey = keyof typeof LOCATIONS;

// Cambia esto según dónde esté la Raspberry Pi ahora mismo.
export const ACTIVE_LOCATION: LocationKey = 'segur';

export const RPI_IP = LOCATIONS[ACTIVE_LOCATION];

export const STREAM_URL = `http://${RPI_IP}:8888/drone/index.m3u8`;
export const API_URL = `http://${RPI_IP}:8000`;
