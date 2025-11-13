import DatabaseRepository from "./database.repository.js";
class FriendRequestRepository extends DatabaseRepository {
    constructor(FriendRequestModel) {
        super(FriendRequestModel);
    }
}
export default FriendRequestRepository;
