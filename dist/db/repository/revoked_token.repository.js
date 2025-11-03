import DatabaseRepository from "./database.repository.js";
class RevokedTokenRepository extends DatabaseRepository {
    constructor(RevokedTokenModel) {
        super(RevokedTokenModel);
    }
}
export default RevokedTokenRepository;
