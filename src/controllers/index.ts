import type { FastifyInstance } from "fastify";
import type Dependencies from "../Dependencies";
import PostsList from "./ports/list";

export type IController = (fastify: FastifyInstance, di?: Dependencies) => void;

const controllers: IController[] = [
    PostsList,
];

export default controllers;
