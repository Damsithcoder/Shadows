import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  devtool: 'cheap-module-source-map'
})
// // webpack.config.js
// module.exports = {
//   // ...
//   devtool: 'cheap-module-source-map',
//   // ...
// };