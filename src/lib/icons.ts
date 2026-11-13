/**
 * Real brand logos for every technology, bundled as static assets.
 *
 * Most come from Devicon (full-colour originals). Brands Devicon lacks come
 * from Simple Icons as monochrome paths tinted with their brand colour.
 */
import blender from "devicon/icons/blender/blender-original.svg";
import bun from "devicon/icons/bun/bun-original.svg";
import cloudflare from "devicon/icons/cloudflare/cloudflare-original.svg";
import cmake from "devicon/icons/cmake/cmake-original.svg";
import cpp from "devicon/icons/cplusplus/cplusplus-original.svg";
import css from "devicon/icons/css3/css3-original.svg";
import docker from "devicon/icons/docker/docker-original.svg";
import express from "devicon/icons/express/express-original.svg";
import fastapi from "devicon/icons/fastapi/fastapi-original.svg";
import flask from "devicon/icons/flask/flask-original.svg";
import ghidra from "devicon/icons/ghidra/ghidra-original.svg";
import git from "devicon/icons/git/git-original.svg";
import github from "devicon/icons/github/github-original.svg";
import githubactions from "devicon/icons/githubactions/githubactions-original.svg";
import html from "devicon/icons/html5/html5-original.svg";
import javascript from "devicon/icons/javascript/javascript-original.svg";
import linkedin from "devicon/icons/linkedin/linkedin-original.svg";
import linux from "devicon/icons/linux/linux-original.svg";
import lua from "devicon/icons/lua/lua-original.svg";
import mongodb from "devicon/icons/mongodb/mongodb-original.svg";
import mysql from "devicon/icons/mysql/mysql-original.svg";
import nextjs from "devicon/icons/nextjs/nextjs-original.svg";
import nginx from "devicon/icons/nginx/nginx-original.svg";
import nodejs from "devicon/icons/nodejs/nodejs-original.svg";
import playwright from "devicon/icons/playwright/playwright-original.svg";
import postgresql from "devicon/icons/postgresql/postgresql-original.svg";
import prisma from "devicon/icons/prisma/prisma-original.svg";
import pytest from "devicon/icons/pytest/pytest-original.svg";
import python from "devicon/icons/python/python-original.svg";
import pyqt from "devicon/icons/qt/qt-original.svg";
import react from "devicon/icons/react/react-original.svg";
import reactrouter from "devicon/icons/reactrouter/reactrouter-original.svg";
import socketio from "devicon/icons/socketio/socketio-original.svg";
import sqlalchemy from "devicon/icons/sqlalchemy/sqlalchemy-original.svg";
import sqlite from "devicon/icons/sqlite/sqlite-original.svg";
import supabase from "devicon/icons/supabase/supabase-original.svg";
import tailwind from "devicon/icons/tailwindcss/tailwindcss-original.svg";
import threejs from "devicon/icons/threejs/threejs-original.svg";
import typescript from "devicon/icons/typescript/typescript-original.svg";
import ubuntu from "devicon/icons/ubuntu/ubuntu-original.svg";
import vite from "devicon/icons/vitejs/vitejs-original.svg";
import vitest from "devicon/icons/vitest/vitest-original.svg";
import vscode from "devicon/icons/vscode/vscode-original.svg";
import zustand from "devicon/icons/zustand/zustand-original.svg";
import discordSvg from "simple-icons/icons/discord.svg?raw";
import framerSvg from "simple-icons/icons/framer.svg?raw";
import mkdocsSvg from "simple-icons/icons/materialformkdocs.svg?raw";
import pydanticSvg from "simple-icons/icons/pydantic.svg?raw";
import zodSvg from "simple-icons/icons/zod.svg?raw";

import type { TechId } from "@/data/types";

function tint(svg: string, color: string): string {
  const colored: string = svg.replace("<svg ", `<svg fill="${color}" `);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(colored)}`;
}

const ICONS: Partial<Record<TechId, string>> = {
  blender,
  bun,
  cloudflare,
  cmake,
  cpp,
  css,
  docker,
  express,
  fastapi,
  flask,
  ghidra,
  git,
  github,
  githubactions,
  html,
  javascript,
  linux,
  lua,
  mongodb,
  mysql,
  nextjs,
  nginx,
  nodejs,
  playwright,
  postgresql,
  prisma,
  pytest,
  python,
  pyqt,
  react,
  reactrouter,
  socketio,
  sqlalchemy,
  sqlite,
  supabase,
  tailwind,
  threejs,
  typescript,
  ubuntu,
  vite,
  vitest,
  vscode,
  zustand,
  discord: tint(discordSvg, "#5865f2"),
  framer: tint(framerSvg, "#bb4bff"),
  mkdocs: tint(mkdocsSvg, "#526cfe"),
  pydantic: tint(pydanticSvg, "#e92063"),
  zod: tint(zodSvg, "#3e67b1"),
};

export const SOCIAL_ICONS: Readonly<Record<"github" | "discord" | "linkedin", string>> = {
  github,
  discord: tint(discordSvg, "#5865f2"),
  linkedin,
};

/** Returns the logo URL for a technology, or `null` when none is bundled. */
export function getIconUrl(id: TechId): string | null {
  return ICONS[id] ?? null;
}
