import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../components/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/forum",
    name: "Forum",
    component: () => import("../views/Forum.vue"),
  },
  {
    path: "/locations",
    name: "Locations",
    component: () => import("../views/Locations.vue"),
  },
  {
    path: "/songs",
    name: "Songs",
    component: () => import("../views/Songs.vue"),
  },
  {
    path: "/posts",
    name: "AllPosts",
    component: () => import("../views/AllPosts.vue"),
  },
  {
    path: "/study",
    name: "Study",
    component: () => import("../views/Study.vue"),
  },
];

const router = createRouter({
  history: createWebHistory("/maimatch_web/"),
  routes,
});

export default router;
