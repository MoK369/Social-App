import jwt from "jsonwebtoken";
class Token {
    static generate = ({ payload, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, options = {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
    }, }) => {
        return jwt.sign(payload, secret, options);
    };
}
export default Token;
