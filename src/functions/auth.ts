import { User } from "../schema/user";

const checkIfEmailExists = async (email: string) => {
  console.log("here")
  const user = await User.find({ email: email }).lean()
    .exec();
  if (user.length !== 0) {
    return {
      exists: true,
      user: user,
    };
  }
  return {
    exists: false,
    user: null,
  };
};

export { checkIfEmailExists };
