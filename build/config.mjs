import path from 'path'
import {fileURLToPath} from 'url'
import alias from '@rollup/plugin-alias'
import PostCSS from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve'
import { createRequire } from "module"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

export default {
  entry: path.resolve(__dirname, '../src/index.js'),
  plugins: {
    alias: [
      alias({
        entries: [
          {
            find: '@',
            replacement: `${path.resolve(__dirname, '../src')}`
          }
        ],
        customResolver: resolve({
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue']
        })
      })
    ],
    postcss: [
      PostCSS({
        include: /(?<!&module=.*)\.css$/,
        plugins: [
          require('postcss-import'),
          require('postcss-nested'),
          require('tailwindcss'),
          require('autoprefixer')
        ]
      })
    ],
    babel: {
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue']
    }
  }
}
