import type { Model } from "mongoose";
import type { IRevokedToken as TDocument } from "../interfaces/revoked_token.interface.ts";
import DatabaseRepository from "./database.repository.ts";

class RevokedTokenRepository extends DatabaseRepository<TDocument> {
  constructor(RevokedTokenModel: Model<TDocument>) {
    super(RevokedTokenModel);
  }
}

export default RevokedTokenRepository;
