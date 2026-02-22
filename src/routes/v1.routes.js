import express from 'express';
import userRoute from '../modules/user/user.routes.js';
import courseRoute from '../modules/course/course.routes.js';

const router = express.Router();

const defaultRoutes = [
    {
        path: '/user',
        route: userRoute,
    },
    {
        path: '/course',
        route: courseRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
