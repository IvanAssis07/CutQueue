import { app } from "./config/expressConfig";

app.listen(process.env.PORT, () => {
    console.log(`Server running at port ${process.env.PORT}`);
})