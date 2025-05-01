import netlifyPlugin from '@netlify/next';
const withNetlify = netlifyPlugin.withNetlify;

export default withNetlify({
  reactStrictMode: true,
  images: {
    domains: [
      'cdn.modelcarshouston.com',
      'i.ebayimg.com',
      'www.stmdiecast.com',
      'fairfieldcollectibles.com',
      'www.awesomediecast.com',
    ],
  },
});
