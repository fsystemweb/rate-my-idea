// apps/api/dev-server.ts

import { createApp } from ".";


const app = createApp();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API dev server → http://localhost:${port}/api`);
});