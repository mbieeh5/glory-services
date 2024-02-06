const CopyPlugin = require('copy-webpack-plugin');
/**
 * @type {import('next').nextConfig}  
*/
const nextConfig = {
  output: 'export'
}

module.exports = {
  images: {
    unoptimized: true,
  },
  nextConfig
};