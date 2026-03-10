import { User } from "shared";


const testUserFixture: User = {
  id: "user-1",
  email: "test@example.com",
  role: "user",
  name: "Test User",
  racerId: undefined,
};

export const createUserFixture = (partial?: Partial<User>): User => ({
  ...testUserFixture,
  ...partial,
});
