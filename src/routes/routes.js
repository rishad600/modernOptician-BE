import express from 'express';
import adminRoutes from '../portals/admin/routes.js';
import userRoutes from '../portals/user/routes.js';
import publicRoutes from '../portals/public/routes.js';

const router = express.Router();

const defaultRoutes = [
    {
        path: '/admin',
        route: adminRoutes,
    },
    {
        path: '/user',
        route: userRoutes,
    },
    {
        path: '/public',
        route: publicRoutes,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
