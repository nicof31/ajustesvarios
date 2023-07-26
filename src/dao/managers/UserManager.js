import UserModel from "../models/users.model.js";


export default class UserManager {
  async register(userInfo) {
    try {
      let result = await UserModel.create(userInfo);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  async login({ email, password }) {
    try {
      let user = await this.getUser(email);
      if (user?.error) throw new Error(`Wrong user or password.`);
      if (user.password !== password)
        throw new Error(`Wrong user or password.`);
      delete user.password;
      return { status: `success`, payload: user };
    } catch (error) {
      return { error: error.message };
    }
  }

  async getUser(email) {
    try {
      let user = await UserModel.findOne({ email }, { __v: 0 }).lean();
      if (!user) throw new Error(`User not exists.`);
      return user;
    } catch (error) {
      return { error: error.message };
    }
  }
}
