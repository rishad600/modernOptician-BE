export const makeUserService = ({ userRepository, config, jwt }) => {
    const register = async (userData) => {
        const user = await userRepository.create(userData);
        const token = generateToken(user._id);

        user.activeToken = token;
        await user.save();

        return { user, token };
    };

    const login = async (email, password) => {
        const user = await userRepository.findByEmail(email);

        if (!user || !(await user.matchPassword(password))) {
            throw new Error('Invalid credentials');
        }

        const token = generateToken(user._id);

        user.activeToken = token;
        await user.save();

        return { user, token };
    };

    const getAllUsers = async () => {
        return await userRepository.findAll();
    };

    const getUserById = async (id) => {
        return await userRepository.findById(id);
    };

    const generateToken = (id) => {
        return jwt.sign({ id }, config.jwt.secret, {
            expiresIn: config.jwt.accessExpirationMinutes,
        });
    };

    return Object.freeze({
        register,
        login,
        getAllUsers,
        getUserById,
    });
};
