export const makeAdminController = ({ adminService, asyncHandler, Response }) => {
    const register = asyncHandler(async (req, res, next) => {
        const { admin, token } = await adminService.register(req.body);
        res.status(201).json(Response.success('Successfully created', { admin, token }, 201));
    });

    const login = asyncHandler(async (req, res, next) => {
        const { email, password } = req.body;
        const { admin, token } = await adminService.login(email, password);
        res.json(Response.success('Admin logged in successfully', { admin, token }));
    });

    return Object.freeze({
        register,
        login,
    });
};
