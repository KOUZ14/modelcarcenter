const netlifyPlugin = require('@netlify/next');
const withNetlify = netlifyPlugin.withNetlify;

module.exports = withNetlify({
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
