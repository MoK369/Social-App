import type { Model } from "mongoose";
import type { IUser as TDocument } from "../interfaces/user.interface.ts";
import DatabaseRepository from "./database.repository.ts";

class UserRepository extends DatabaseRepository<TDocument> {
  constructor(UserModel: Model<TDocument>) {
    super(UserModel);
  }
}


export default UserRepository;
