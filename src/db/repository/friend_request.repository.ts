import DatabaseRepository from "./database.repository.ts";
import type { IFriendRequest as TDocument } from "../interfaces/friend_request.interface.ts";
import type { Model } from "mongoose";

class FriendRequestRepository extends DatabaseRepository<TDocument> {
  constructor(FriendRequestModel: Model<TDocument>) {
    super(FriendRequestModel);
  }
}

export default FriendRequestRepository;
