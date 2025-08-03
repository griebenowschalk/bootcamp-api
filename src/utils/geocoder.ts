import NodeGeocoder, {
  type Providers,
  type Options,
  type Geocoder,
} from 'node-geocoder';

let geocoder: Geocoder;

const getGeocoder = () => {
  if (!geocoder) {
    geocoder = NodeGeocoder({
      provider: process.env.GEOCODER_PROVIDER as Providers,
      apiKey: process.env.GEOCODER_API_KEY,
      formatter: null,
    } as Options);
  }
  return geocoder;
};

export default getGeocoder;
