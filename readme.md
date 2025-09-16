## Scripts package.json

- `npm run dev` → Starts development server with auto-reloading (`nodemon`) → starts with nodemon
- `npm run build` → Compiles TypeScript to JavaScript in `/dist`
- `npm start` → Runs the compiled JavaScript using Node → Executes compiled JS: node dist/index.js
- `npm test` → Placeholder for test command

## nodemon.json Explanation

- `"watch"`: Watches the `src/` directory for changes
- `"ext"`: Only triggers reloads for `.ts` files
- `"exec"`: Runs the command `ts-node src/index.ts` on each restart

