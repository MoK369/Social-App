class AuthenticationService {
    signup = async (req, res) => {
        return res
            .status(201)
            .json({ message: "User signed up successfully", body: req.body });
    };
    login = async (req, res) => {
        return res
            .json({ message: "User logged in successfully", body: req.body });
    };
}
export default new AuthenticationService();
