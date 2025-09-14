import { Elysia } from "elysia";
import { player } from "./module/player";
import { government } from "./module/government";
import { jobs } from "./module/job";
import { openapi } from "@elysiajs/openapi";

const app =
    new Elysia({
        prefix: '/v1',
        normalize: true
    })
        .use(openapi())
        .use(player)
        .use(government)
        .use(jobs)
        .listen(3000);


console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
