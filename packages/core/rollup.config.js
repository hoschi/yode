import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default [
    {
        input: 'src/index.js',
        onwarn: function (message) {
            if (/external dependency/.test(message)) {
                return
            }
            console.error(message)
        },
        output: [
            {
                file: pkg.main,
                format: 'cjs'
            },
            {
                file: pkg.module,
                format: 'es'
            }
        ],
        plugins: [
            babel({
                exclude: ['**/node_modules/**']
            })
        ]
    }
]
