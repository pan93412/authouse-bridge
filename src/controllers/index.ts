import type { FastifyInstance } from "fastify";
import type Dependencies from "../Dependencies";
import PostsList from "./ports/list";
import PostsResolve from "./ports/resolve";
import PostsWrite from "./ports/interact";

export type IController = (fastify: FastifyInstance, di?: Dependencies) => void;

const controllers: IController[] = [
    PostsList,
    PostsResolve,
    PostsWrite,
];

export default controllers;
