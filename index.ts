import { app } from "./config/expressConfig";
import { getEnv } from './utils/functions/getEnv';

const port = getEnv('PORT');


app.listen(port, () => {
    console.log(`Server running at port ${port}`);
})